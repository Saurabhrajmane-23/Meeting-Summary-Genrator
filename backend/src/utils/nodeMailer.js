import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "meetbeater23@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const createPaymentSuccessTemplate = (
  username,
  planType,
  planPrice,
  planFeatures,
  planStartDate,
  planExpiryDate,
  paymentId
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - Quill AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header with SVG Background -->
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); position: relative; padding: 40px 30px; overflow: hidden;">
            <!-- SVG Background Pattern -->
            <svg style="position: absolute; top: 0; right: 0; width: 200px; height: 150px; opacity: 0.3;" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40L60 20L100 40L140 20L180 40L180 80L140 100L100 80L60 100L20 80Z" fill="#34d399"/>
                <path d="M40 60L80 40L120 60L160 40L200 60L200 100L160 120L120 100L80 120L40 100Z" fill="#6ee7b7"/>
                <circle cx="150" cy="30" r="15" fill="#a7f3d0"/>
                <circle cx="170" cy="70" r="10" fill="#d1fae5"/>
            </svg>
            
            <!-- Company Logo and Branding -->
            <div style="position: relative; z-index: 2;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <!-- Logo using the provided link -->
                    <div style="width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 15px; overflow: hidden;">
                        <img src="https://i.ibb.co/C554DXrP/image.png" alt="Quill AI Logo" style="width: 60px; height: 60px; object-fit: cover; border-radius: 12px;" />
                    </div>
                    <div>
                        <h1 style="color: white; font-size: 28px; font-weight: 700, margin: 0, line-height: 1.2;">Payment Successful! 🎉</h1>
                        <p style="color: #a7f3d0; font-size: 16px, margin: 5px 0 0 0;">Welcome to premium Quill AI experience</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>${username}</strong>! Your payment has been successfully processed and your <strong>${planType} Plan</strong> is now active!
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                You now have access to all premium features that will supercharge your meeting productivity:
            </p>
            
            <!-- Plan Details -->
            <div style="background: #f0fdf4; border-radius: 12px; padding: 30px; border: 1px solid #bbf7d0; margin: 30px 0;">
                <h3 style="color: #166534; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">Your Plan Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600; width: 30%;">Plan:</td>
                        <td style="padding: 8px 0; color: #4b5563;">${planType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Price:</td>
                        <td style="padding: 8px 0; color: #4b5563;">${planPrice}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Features:</td>
                        <td style="padding: 8px 0; color: #4b5563;">${planFeatures}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Active From:</td>
                        <td style="padding: 8px 0; color: #4b5563;">${planStartDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Expires:</td>
                        <td style="padding: 8px 0; color: #4b5563;">${planExpiryDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Payment ID:</td>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 12px; font-family: monospace;">${paymentId}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Features List -->
            <div style="margin: 30px 0;">
                <h4 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">What you can do now:</h4>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 15px;"><strong>1.</strong> Upload many more recordings</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 15px;"><strong>2.</strong> Get AI-powered summaries and insights</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 15px;"><strong>3.</strong> Export summaries as PDF</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 15px;"><strong>4.</strong> Enjoy priority customer support</span>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Follow Me</h3>
                <div style="margin-bottom: 20px;">
                    <!-- Text-based social links with better visibility -->
                    <div style="text-align: center;">
                        <a href="https://www.instagram.com/saurabh.r23/" style="color: #e91e63; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">Instagram</a>
                        <a href="https://www.linkedin.com/in/saurabh-rajmane-a67b5226b/" style="color: #0077b5; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">LinkedIn</a>
                        <a href="https://github.com/Saurabhrajmane-23" style="color: #333; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">GitHub</a>
                        <a href="mailto:iamsaurabhrajmane@gmail.com" style="color: #ea4335; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">Email</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

const createEmailTemplate = (username, verificationCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quill AI - Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header with SVG Background -->
        <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); position: relative; padding: 40px 30px; overflow: hidden;">
            <!-- Company Logo and Branding -->
            <div style="position: relative; z-index: 2;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <!-- Logo using the provided link -->
                    <div style="width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 15px; overflow: hidden;">
                        <img src="https://i.ibb.co/C554DXrP/image.png" alt="Quill AI Logo" style="width: 60px; height: 60px; object-fit: cover; border-radius: 12px;" />
                    </div>
                    <div>
                        <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.2;">Quill AI</h1>
                        <p style="color: #93c5fd; font-size: 16px; margin: 5px 0 0 0;">Where Clarity Cuts Through the Chatter</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hello <strong>${username}</strong>, I'm really excited to welcome you on board with our smart transcription & summarization service!
            </p>
            
            <!-- Features List -->
            <div style="margin: 30px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 15px;"><strong>1.</strong> Get instant AI-powered meeting summaries</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 15px;"><strong>2.</strong> Save hours of manual note-taking</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 15px;"><strong>3.</strong> Transform meeting chaos into clarity</span>
                </div>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                There's just one tiny thing left to do to make all those amazing things happen:
            </p>
            
            <!-- Verification Code Section -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center; border: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Your Verification Code:</p>
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px 40px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 20px 0; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                    ${verificationCode}
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                    This code will expire in 10 minutes
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #374151; font-size: 18px; font-weight: 600, margin: 0 0 15px 0;">Follow Me</h3>
                <div style="margin-bottom: 20px;">
                    <!-- Text-based social links with better visibility -->
                    <div style="text-align: center;">
                        <a href="https://www.instagram.com/saurabh.r23/" style="color: #e91e63; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">Instagram</a>
                        <a href="https://www.linkedin.com/in/saurabh-rajmane-a67b5226b/" style="color: #0077b5; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">LinkedIn</a>
                        <a href="https://github.com/Saurabhrajmane-23" style="color: #333; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">GitHub</a>
                        <a href="mailto:iamsaurabhrajmane@gmail.com" style="color: #ea4335; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 15px; display: inline-block;">Email</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

const sendEmail = async (
  to,
  subject,
  text,
  username = "",
  verificationCode = "",
  emailType = "verification",
  paymentData = null
) => {
  try {
    let htmlContent;

    if (emailType === "payment_success" && paymentData) {
      htmlContent = createPaymentSuccessTemplate(
        paymentData.username,
        paymentData.planType,
        paymentData.planPrice,
        paymentData.planFeatures,
        paymentData.planStartDate,
        paymentData.planExpiryDate,
        paymentData.paymentId
      );
    } else {
      htmlContent = createEmailTemplate(username, verificationCode);
    }

    await transporter.sendMail({
      from: "meetbeater23@gmail.com",
      to,
      subject,
      text,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
