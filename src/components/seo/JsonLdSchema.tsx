import { Helmet } from 'react-helmet-async';

/** JSON-LD accepts schema objects without using any unsafe inline HTML elsewhere. */
export interface JsonLdSchemaProps {
  readonly id: string;
  readonly schema: Record<string, unknown>;
}

/** Renders a single structured-data block with deterministic formatting. */
export const JsonLdSchema = ({ id, schema }: JsonLdSchemaProps) => (
  <Helmet>
    <script id={id} type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  </Helmet>
);
