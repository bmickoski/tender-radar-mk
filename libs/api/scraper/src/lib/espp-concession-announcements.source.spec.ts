import { parseConcessionAnnouncementsHtml } from './espp-concession-announcements.source';

describe('parseConcessionAnnouncementsHtml', () => {
  it('extracts concession rows from the public ESPP listing HTML', () => {
    const html = `
      <html>
        <body>
          <div>Договорен орган Опис на огласот Датум на објава Документи</div>
          <div>Општина Штип Доделување на Договор за воспоставување на јавно приватно партнерство за модернизација на системот за јавно осветлување,...29.12.2025</div>
          <div>Општина Свети Николе Реконструкција,модернизација и одржување на јавното осветлување во Општина Свети Николе 26.12.2025</div>
          <div>Страница 1 2 3 од 10 Приказ на страна од 1 до 10 од 99</div>
        </body>
      </html>
    `;

    const records = parseConcessionAnnouncementsHtml(
      html,
      'https://www.e-nabavki.gov.mk/PublicAccess/ConcessionAnnouncements/'
    );

    expect(records).toHaveLength(2);
    expect(records[0]?.authority).toBe('Општина Штип');
    expect(records[0]?.category).toBe('PPP / Concessions');
    expect(records[1]?.title).toContain('Реконструкција,модернизација');
  });
});
