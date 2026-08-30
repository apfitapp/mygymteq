import React from 'react';
import { Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50 w-full">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-3 px-3 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-wider uppercase">
          <Lock className="size-3 text-primary mr-1.5 inline" />
          <span>COMMON QUESTIONS</span>
        </Badge>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-2">
          Everything you need to know about setting up and running GymTech.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-border bg-card shadow-xs rounded-xl">
        <Accordion defaultExpandedKeys={['faq-1']}>
          <AccordionItem id="faq-1">
            <AccordionTrigger>What are the primary portals and roles in GymTech?</AccordionTrigger>
            <AccordionContent>
              GymTech features a clean role-based architecture: <strong>Owner / Admin</strong> for complete gym operations, package management, attendance, and revenue; <strong>Trainer Desk</strong> for high-speed check-ins and PT client allocations; and <strong>Member Portal</strong> for members to check their plan status and digital QR card.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="faq-2">
            <AccordionTrigger>How does the automated WhatsApp receipt feature work?</AccordionTrigger>
            <AccordionContent>
              When a payment or renewal is recorded, GymTech generates a pre-formatted click-to-chat WhatsApp link with the member's unique receipt number, package details, and transaction amount. Your front desk can share official receipts with one tap without paying third-party WhatsApp API costs.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="faq-3">
            <AccordionTrigger>How is gym data secured and isolated?</AccordionTrigger>
            <AccordionContent>
              Every gym's data is strictly isolated with tenant-scoped queries enforced on the API layer. A gym owner or staff can never access another gym's members, payments, or financial reports.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="faq-4">
            <AccordionTrigger>Can I import existing members from our Excel spreadsheet?</AccordionTrigger>
            <AccordionContent>
              Yes! GymTech provides a built-in one-click member import tool. You can upload your existing member list with phone numbers, joining dates, and plan details in seconds, or our team will migrate it for you for free.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="faq-5">
            <AccordionTrigger>What happens when a member travels or gets injured?</AccordionTrigger>
            <AccordionContent>
              GymTech includes a native <strong>Freeze / Pause</strong> feature. You can pause a member's active plan with one click. Their remaining active days are preserved exactly and restored when you unfreeze their account.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </section>
  );
};
