import { EnquiryList } from '@/components/studio/enquiry-list';
import { StudioHeader } from '@/components/studio/studio-ui';
import { prisma, safeQuery } from '@/lib/prisma';

export const metadata = { title: 'Inbox' };

export default async function StudioEnquiriesPage() {
  const [enquiries, messages] = await Promise.all([
    safeQuery(() => prisma.b2BEnquiry.findMany({ orderBy: { createdAt: 'desc' } }), []),
    safeQuery(() => prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }), []),
  ]);

  return (
    <>
      <StudioHeader
        title="Inbox"
        description="Corporate enquiries and contact messages, including newsletter signups from the footer."
      />

      <EnquiryList
        enquiries={enquiries.map((enquiry) => ({
          id: enquiry.id,
          kind: 'B2B' as const,
          title: enquiry.companyName,
          subtitle: `${enquiry.contactName} · ${enquiry.email}${enquiry.phone ? ` · ${enquiry.phone}` : ''}`,
          message: enquiry.message,
          status: enquiry.status,
          adminNote: enquiry.adminNote ?? '',
          createdAt: enquiry.createdAt.toISOString(),
          meta: [
            enquiry.industry,
            enquiry.headcount ? `${enquiry.headcount} people` : null,
            enquiry.garmentTypes.length ? enquiry.garmentTypes.join(', ') : null,
            enquiry.neededBy ? `Needed by ${enquiry.neededBy.toDateString()}` : null,
            enquiry.budgetNote,
          ].filter((value): value is string => Boolean(value)),
        }))}
        messages={messages.map((message) => ({
          id: message.id,
          kind: 'MESSAGE' as const,
          title: message.name,
          subtitle: `${message.email}${message.phone ? ` · ${message.phone}` : ''}`,
          message: message.message,
          status: message.status,
          adminNote: message.adminNote ?? '',
          createdAt: message.createdAt.toISOString(),
          meta: [message.topic],
        }))}
      />
    </>
  );
}
