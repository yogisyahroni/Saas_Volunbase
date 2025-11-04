import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

function getSes() {
  const region = process.env.AWS_REGION || 'us-east-1';
  return new SESClient({ region });
}

export async function sendReminderEmail(to: string, subject: string, html: string) {
  const from = process.env.SES_FROM_EMAIL || 'no-reply@volunbase.com';
  const client = getSes();
  await client.send(
    new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      Message: {
        Body: { Html: { Data: html } },
        Subject: { Data: subject },
      },
      Source: from,
    })
  );
}

