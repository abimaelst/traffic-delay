export async function sendEmail(to: string, message: string): Promise<void> {
  console.log(`📨 Mock email sent to ${to}:\n${message}`);
}