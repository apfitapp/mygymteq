import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MessageSquare, MessageCircle, Mail, Smartphone, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SmtpConfigBlock } from '@/components/settings/SmtpConfigBlock';
import { SmtpSettings } from '@gymtech/shared';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

const DEFAULT_SMTP: SmtpSettings = {
  enabled: false,
  provider: 'CUSTOM',
  host: '',
  port: 587,
  secure: false,
  username: '',
  password: '',
  fromName: '',
  fromEmail: '',
};

export const SettingsNotificationsPage: React.FC = () => {
  const { gym, user } = useAuth();

  const { data } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => api.getNotificationSettings(),
  });

  const [reminderDays, setReminderDays] = useState(7);
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [receiptEnabled, setReceiptEnabled] = useState(true);
  const [expiryEnabled, setExpiryEnabled] = useState(true);
  const [smtp, setSmtp] = useState<SmtpSettings>(DEFAULT_SMTP);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) return;
    setReminderDays(data.reminderDays);
    setWelcomeEnabled(data.welcomeEnabled);
    setReceiptEnabled(data.receiptEnabled);
    setExpiryEnabled(data.expiryEnabled);
    if (data.smtp) {
      setSmtp(data.smtp);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateNotificationSettings({
        reminderDays,
        welcomeEnabled,
        receiptEnabled,
        expiryEnabled,
        smtp,
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => saveMutation.mutate();

  return (
    <AppShell title="Notification Settings" breadcrumb="System">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Notification &amp; WhatsApp Settings
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure automated customer alerts and pre-filled WhatsApp templates
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-lg border border-ok/30 bg-ok/10 text-ok text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4" /> Preferences saved successfully!
          </div>
        )}

        {saveMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {(saveMutation.error as Error)?.message || 'Failed to save preferences. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Primary Delivery Channel */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold">Primary Communication Channel</CardTitle>
            <CardDescription className="text-xs">
              Delivery mechanism for receipts, alerts, and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 flex flex-col gap-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <MessageCircle className="size-4 text-[#25D366] fill-current" />
                    WhatsApp
                  </div>
                  <span className="size-2 rounded-full bg-primary"></span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Direct Click-to-Chat URLs with pre-filled messaging
                </p>
                <span className="text-[10px] font-mono text-primary font-semibold mt-2">
                  ACTIVE (Zero API cost)
                </span>
              </div>

              <div className="p-4 rounded-lg border border-border bg-surface-2 opacity-60 flex flex-col gap-1 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Smartphone className="size-4 text-muted-foreground" />
                    SMS Gateway
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  DLT Template SMS Provider (Fast2SMS / Twilio)
                </p>
                <span className="text-[10px] font-mono text-muted-foreground mt-2">
                  DISABLED IN MVP
                </span>
              </div>

              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 flex flex-col gap-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Mail className="size-4 text-primary" />
                    Automated Email
                  </div>
                  <span className="size-2 rounded-full bg-primary"></span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Automated receipts, welcome letters &amp; password resets
                </p>
                <span className="text-[10px] font-mono text-primary font-semibold mt-2">
                  ACTIVE (Free Automated Engine)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trigger Rules */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold">Automated Trigger Rules</CardTitle>
            <CardDescription className="text-xs">
              Toggle operational notifications for members
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Membership Expiry Reminders
                </span>
                <span className="text-xs text-muted-foreground">
                  Generate WhatsApp links for members reaching term expiration
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground">Trigger Window:</span>
                  {[3, 5, 7, 10].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setReminderDays(days)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                        reminderDays === days
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
              <Switch checked={expiryEnabled} onCheckedChange={setExpiryEnabled} />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Welcome WhatsApp Message
                </span>
                <span className="text-xs text-muted-foreground">
                  Send welcome link with assigned Member Code upon enrollment
                </span>
              </div>
              <Switch checked={welcomeEnabled} onCheckedChange={setWelcomeEnabled} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Payment Receipt Sharing
                </span>
                <span className="text-xs text-muted-foreground">
                  Generate instant receipt links whenever fee payments are recorded
                </span>
              </div>
              <Switch checked={receiptEnabled} onCheckedChange={setReceiptEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Custom SMTP Configurable Block */}
        <SmtpConfigBlock
          smtp={smtp}
          onChange={setSmtp}
          userEmail={user?.email}
          gymName={gym?.name}
        />

        {/* Message Template Previews */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold">WhatsApp Message Preview</CardTitle>
            <CardDescription className="text-xs">
              Pre-filled messages generated for your members
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3">
            <div className="p-3 rounded-lg bg-surface-2 border border-border text-xs font-sans flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase text-primary">Receipt Template</span>
              <p className="text-foreground">
                Hi Rahul Sharma, we have received ₹1,500 via UPI for your membership at {gym?.name || 'Iron House Fitness'}. Receipt No: RCP-2026-0012. Thank you! 🧾✨
              </p>
            </div>

            <div className="p-3 rounded-lg bg-surface-2 border border-border text-xs font-sans flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase text-primary">Expiry Reminder Template</span>
              <p className="text-foreground">
                Hi Rahul Sharma, your membership at {gym?.name || 'Iron House Fitness'} is expiring on 15/09/2026. Please renew to keep achieving your fitness goals without interruption! ⏳🔥
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-primary text-primary-foreground font-bold text-xs h-9 px-6"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
};
