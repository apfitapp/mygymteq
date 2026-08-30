import type { NativeRouter } from '../router/router';
import { json, errorResponse } from '../lib/response';
import { requireGym } from '../lib/tenant';

export function registerMediaRoutes(router: NativeRouter): void {
  // Upload media
  router.post('/api/v1/media/upload', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    try {
      const contentType = req.headers.get('Content-Type') || '';
      let fileBuffer: ArrayBuffer | null = null;
      let fileName = `image-${Date.now()}.jpg`;
      let fileMime = 'image/jpeg';

      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) return errorResponse('No file provided in form data', 400);
        fileBuffer = await file.arrayBuffer();
        fileName = file.name || fileName;
        fileMime = file.type || fileMime;
      } else {
        fileBuffer = await req.arrayBuffer();
        fileMime = contentType || fileMime;
      }

      if (!fileBuffer || fileBuffer.byteLength === 0) {
        return errorResponse('Empty file upload', 400);
      }

      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageKey = `${ctx.gymId}/${Date.now()}-${safeName}`;

      if (ctx.env.MEDIA_BUCKET) {
        await ctx.env.MEDIA_BUCKET.put(storageKey, fileBuffer, {
          httpMetadata: { contentType: fileMime },
          customMetadata: { gymId: String(ctx.gymId), uploadedBy: String(ctx.user?.id ?? '') },
        });
      }

      return json({
        success: true,
        storageKey,
        url: `/api/v1/media/${storageKey}`,
        fileName,
        mimeType: fileMime,
        sizeBytes: fileBuffer.byteLength,
      }, 201);
    } catch (err: any) {
      return errorResponse(`Image upload failed: ${err.message}`, 500);
    }
  });

  // Get media object
  router.get('/api/v1/media/:gymId/:key', async (req, ctx) => {
    const fullKey = `${ctx.params.gymId}/${ctx.params.key}`;
    if (!ctx.env.MEDIA_BUCKET) {
      return errorResponse('R2 Object Storage is not configured in this environment', 503);
    }
    const object = await ctx.env.MEDIA_BUCKET.get(fullKey);
    if (!object) return errorResponse('Media object not found', 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(object.body, { headers });
  });
}
