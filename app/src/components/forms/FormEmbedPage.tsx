import React from 'react';
import { useParams } from 'react-router-dom';
import FormEmbed from '../crm/sections/forms/FormEmbed';

const FormEmbedPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();

  if (!formId) {
    return <div>Form ID is required</div>;
  }

  return (
    <div className="container py-4">
      <FormEmbed formId={formId} />
    </div>
  );
};

export default FormEmbedPage;
