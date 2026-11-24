const fs = require('fs');
let content = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

if (!content.includes('NewsletterSubscriber')) {
  content = content.replace(
    'seoDescription   String?',
    'seoDescription   String?\n  views            Int           @default(0)'
  );

  const subscriberModel = `
model NewsletterSubscriber {
  id             String    @id @default(cuid())
  email          String    @unique
  consentGiven   Boolean   @default(true)
  consentDate    DateTime  @default(now())
  active         Boolean   @default(true)
  unsubscribedAt DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([active])
}
`;
  content = content.trim() + '\n' + subscriberModel;

  fs.writeFileSync('backend/prisma/schema.prisma', content, 'utf8');
  console.log('Successfully updated schema.prisma');
} else {
  console.log('Already updated');
}
