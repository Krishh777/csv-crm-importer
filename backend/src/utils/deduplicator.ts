import { CRMRecord, SkippedRecord } from '../types';

interface DuplicateEntry {
  recordIndex: number;
  record: CRMRecord;
}

interface DuplicateGroup {
  key: string;
  type: 'email' | 'phone';
  entries: DuplicateEntry[];
}

export class Deduplicator {
  static deduplicateRecords(
    records: CRMRecord[]
  ): { records: CRMRecord[]; duplicates: DuplicateGroup[]; mergedCount: number } {
    const duplicates: DuplicateGroup[] = [];
    const emailMap = new Map<string, DuplicateEntry[]>();
    const phoneMap = new Map<string, DuplicateEntry[]>();
    const recordsToRemove = new Set<number>();

    records.forEach((record, index) => {
      if (record.email) {
        const normalizedEmail = record.email.toLowerCase().trim();
        if (!emailMap.has(normalizedEmail)) {
          emailMap.set(normalizedEmail, []);
        }
        emailMap.get(normalizedEmail)!.push({ recordIndex: index, record });
      }

      if (record.mobile_without_country_code) {
        const normalizedPhone = record.mobile_without_country_code.replace(/\D/g, '');
        if (!phoneMap.has(normalizedPhone)) {
          phoneMap.set(normalizedPhone, []);
        }
        phoneMap.get(normalizedPhone)!.push({ recordIndex: index, record });
      }
    });

    emailMap.forEach((entries, email) => {
      if (entries.length > 1) {
        duplicates.push({
          key: email,
          type: 'email',
          entries,
        });

        for (let i = 1; i < entries.length; i++) {
          recordsToRemove.add(entries[i].recordIndex);
        }
      }
    });

    phoneMap.forEach((entries, phone) => {
      if (entries.length > 1) {
        const phoneGroup = duplicates.find(d => d.key === phone);
        if (!phoneGroup) {
          duplicates.push({
            key: phone,
            type: 'phone',
            entries,
          });

          for (let i = 1; i < entries.length; i++) {
            recordsToRemove.add(entries[i].recordIndex);
          }
        }
      }
    });

    const mergedRecords = records.map((record, index) => {
      if (recordsToRemove.has(index)) {
        return null;
      }

      const emailGroup = emailMap.get(record.email?.toLowerCase() || '');
      const phoneGroup = phoneMap.get(record.mobile_without_country_code?.replace(/\D/g, '') || '');

      let duplicateNote = '';

      if (emailGroup && emailGroup.length > 1 && emailGroup[0].recordIndex === index) {
        duplicateNote = `Merged from ${emailGroup.length} records with same email`;
      } else if (phoneGroup && phoneGroup.length > 1 && phoneGroup[0].recordIndex === index) {
        duplicateNote = `Merged from ${phoneGroup.length} records with same phone`;
      }

      if (duplicateNote) {
        return {
          ...record,
          crm_note: duplicateNote + (record.crm_note ? ` | ${record.crm_note}` : ''),
        };
      }

      return record;
    }).filter((r) => r !== null) as CRMRecord[];

    const mergedCount = recordsToRemove.size;

    return { records: mergedRecords, duplicates, mergedCount };
  }
}
