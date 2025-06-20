import { toast } from 'react-toastify';

export const contactSupport = async () => {
  const appVersion = '1.0.0';
  const manufacturer = navigator.userAgent;
  const deviceModel = 'Web Browser';

  const lineBreak = '\n';
  const email = 'itap@jlamiami.org';
  const subject = 'NH app support';
  const body = `Hi,${lineBreak}${lineBreak}I'm using the NH app and I need your help with:${lineBreak}${lineBreak}${lineBreak}${lineBreak}Thank you,${lineBreak}${lineBreak}App version: ${appVersion}${lineBreak}Device: ${manufacturer} ${deviceModel}`;

  const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try {
    window.location.href = emailUrl;

    // Give a small delay before checking for failures
    setTimeout(() => {
      if (!document.hasFocus()) {
        // Email client likely opened, do nothing
        return;
      }
      // Show toast message if it seems like no action occurred
      toast.info(`If the email app didn’t open, you can reach us at ${email}`);
    }, 1000);
  } catch (error) {
    toast.error(`No email app was found. You can email us at ${email}`);
  }
};
