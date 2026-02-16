import { getSoftwareApplicationSchema } from '@/lib/software-application-schema';

interface SoftwareApplicationSchemaProps {
  locale: string;
  siteName: string;
  description: string;
  url: string;
}

export function SoftwareApplicationSchema({
  locale,
  siteName,
  description,
  url,
}: SoftwareApplicationSchemaProps) {
  const schema = getSoftwareApplicationSchema(locale, siteName, description, url);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
