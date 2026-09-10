import React from 'react';
import { dbService } from '@/lib/db';
import AuthorizationLetterEditor from '@/components/AuthorizationLetterEditor';

export const dynamic = 'force-dynamic';

export default function NewAuthorizationLetterPage() {
  const companies = dbService.getCompanies();

  return (
    <AuthorizationLetterEditor
      companies={companies}
      isNew={true}
    />
  );
}
