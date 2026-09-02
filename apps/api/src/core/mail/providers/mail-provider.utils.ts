import { render } from '@wishlist/mail';

import { mapPayloadToTemplate } from '../mail.mapper';
import { type MailPayload, MailSender } from '../mail.type';

export const getMailPayloadFromMailOptions = async (
  options: MailPayload,
): Promise<{ readonly from: string; readonly html: string }> => {
  const html = await render(mapPayloadToTemplate(options));

  return { from: MailSender.CONTACT, html };
};
