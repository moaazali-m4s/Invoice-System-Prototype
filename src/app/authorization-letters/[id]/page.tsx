import React from 'react';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import AuthorizationLetterEditor from '@/components/AuthorizationLetterEditor';

export const dynamic = 'force-dynamic';

export default function EditAuthorizationLetterPage({ params }: { params: { id: string } }) {
  const letter = dbService.getAuthorizationLetter(params.id);
  if (!letter) notFound();

  const companies = dbService.getCompanies();

  return (
    <AuthorizationLetterEditor
      initialLetter={letter}
      companies={companies}
      isNew={false}
    />
  );
}
