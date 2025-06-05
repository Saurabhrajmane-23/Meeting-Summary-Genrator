import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "meetbeater23@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const createEmailTemplate = (username, verificationCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meet Beater - Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #87CEEB;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to bottom, #87CEEB 0%, #40E0D0 30%, #FFE5B4 70%, #F4A460 100%); min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #87CEEB; border-radius: 10px; overflow: hidden;" bgcolor="#87CEEB">
                    
                    <!-- Header Section -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #87CEEB, #40E0D0); position: relative;">
                            <!-- Sun Icon -->
                            <div style="position: absolute; top: 20px; right: 30px; width: 60px; height: 60px; background: #FFD700; border-radius: 50%; border: 3px solid #FFA500;"></div>
                            
                            <!-- Company Logo -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; vertical-align: middle;">
                                            <span style="font-size: 36px; font-weight: bold; color: #FFFFFF; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); vertical-align: middle;">Meet Beater AI</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 10px;">
                                        <div style="color: #2E8B57; font-size: 16px; font-weight: normal; background-color: rgba(255,255,255,0.8); padding: 5px 15px; border-radius: 15px; display: inline-block;">
                                          Where Clarity Cuts Through the Chatter
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Welcome Section -->
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(255,255,255,0.95); border-radius: 15px; border: 2px solid #40E0D0;" bgcolor="rgba(255,255,255,0.95)">
                                <tr>
                                    <td style="padding: 40px 30px; text-align: center;">
                                        <!-- Welcome Title -->
                                        <h1 style="font-size: 28px; color: #FF6347; margin: 0 0 20px 0; font-weight: bold;">
                                             Welcome Aboard, ${username}! 
                                        </h1>
                                        
                                        <!-- Welcome Message -->
                                        <p style="font-size: 16px; color: #2E8B57; margin: 0 0 30px 0; line-height: 1.6;">
                                             Welcome to the Smart Side of Meetings 

Say goodbye to hour-long recordings and hello to instant insights. We're stoked to have you on board — your smarter meeting workflow starts now.

Just one quick step left to unlock transcripts, summaries, and action items that actually matter.
                                        </p>
                                        
                                        <!-- Verification Code Label -->
                                        <p style="font-size: 18px; color: #2E8B57; margin: 0 0 15px 0; font-weight: bold;">
                                            Your Verification Code:
                                        </p>
                                        
                                        <!-- Verification Code -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td align="center">
                                                    <div style="background: linear-gradient(135deg, #FF6347, #FF4500); color: white; padding: 20px 40px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; display: inline-block; border: 3px solid #FF4500; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                                                        ${verificationCode}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Expiry Notice -->
                                        <p style="color: #2E8B57; font-size: 14px; margin: 20px 0 0 0;">
                                          This code will expire in 10 minutes
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Social Media Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(255,255,255,0.9); border-radius: 15px; border: 2px solid #FFE5B4;" bgcolor="rgba(255,255,255,0.9)">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <h2 style="color: #2E8B57; font-size: 20px; margin: 0 0 25px 0; font-weight: bold;">
                                            Follow me im cool
                                        </h2>
                                        
                                        <!-- Social Icons -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td align="center">
                                                    <!-- Instagram -->
                                                    <a href="https://www.instagram.com/saurabh.r23/" style="text-decoration: none; display: inline-block; margin: 0 10px;">
                                                        <div style="width: 50px; height: 50px; background: linear-gradient(45deg, #F56040, #E1306C); border-radius: 50%; display: inline-block; text-align: center; line-height: 50px; color: white; font-size: 20px; border: 2px solid #E1306C;">
                                                            📷
                                                        </div>
                                                    </a>
                                                    
                                                    <!-- Twitter/X -->
                                                    <a href="https://x.com/Saurabh_e3" style="text-decoration: none; display: inline-block; margin: 0 10px;">
                                                        <div style="width: 50px; height: 50px; background: linear-gradient(45deg, #1DA1F2, #0891B2); border-radius: 50%; display: inline-block; text-align: center; line-height: 50px; color: white; font-size: 20px; border: 2px solid #1DA1F2;">
                                                            🐦
                                                        </div>
                                                    </a>
                                                    
                                                    <!-- LinkedIn -->
                                                    <a href="https://www.linkedin.com/in/saurabh-rajmane-a67b5226b/" style="text-decoration: none; display: inline-block; margin: 0 10px;">
                                                        <div style="width: 50px; height: 50px; background: linear-gradient(45deg, #0077B5, #005885); border-radius: 50%; display: inline-block; text-align: center; line-height: 50px; color: white; font-size: 20px; border: 2px solid #0077B5;">
                                                            💼
                                                        </div>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    
    <!-- Mobile Responsive Styles -->
    <style>
        @media only screen and (max-width: 600px) {
            .mobile-center { text-align: center !important; }
            .mobile-padding { padding: 10px !important; }
            .mobile-font-size { font-size: 24px !important; }
        }
    </style>
</body>
</html>
  `;
};

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
    <title>Payment Successful - Meet Beater AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #87CEEB;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to bottom, #87CEEB 0%, #40E0D0 30%, #32CD32 70%, #228B22 100%); min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #87CEEB; border-radius: 10px; overflow: hidden;" bgcolor="#87CEEB">
                    
                    <!-- Header Section -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #87CEEB, #40E0D0); position: relative;">
                            <!-- Success Icon -->
                            <div style="position: absolute; top: 20px; right: 30px; width: 60px; height: 60px; background: #32CD32; border-radius: 50%; border: 3px solid #228B22; display: flex; align-items: center; justify-content: center; font-size: 30px;">✓</div>
                            
                            <!-- Company Logo -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; vertical-align: middle;">
                                            <span style="font-size: 36px; font-weight: bold; color: #FFFFFF; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); vertical-align: middle;">Meet Beater AI</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 10px;">
                                        <div style="color: #2E8B57; font-size: 16px; font-weight: normal; background-color: rgba(255,255,255,0.8); padding: 5px 15px; border-radius: 15px; display: inline-block;">
                                          Where Clarity Cuts Through the Chatter
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Congratulations Section -->
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(255,255,255,0.95); border-radius: 15px; border: 2px solid #32CD32;" bgcolor="rgba(255,255,255,0.95)">
                                <tr>
                                    <td style="padding: 40px 30px; text-align: center;">
                                        <!-- Success Title -->
                                        <h1 style="font-size: 32px; color: #32CD32; margin: 0 0 20px 0; font-weight: bold;">
                                            🎉 Payment Successful! 🎉
                                        </h1>
                                        
                                        <!-- Congratulations Message -->
                                        <h2 style="font-size: 24px; color: #FF6347; margin: 0 0 20px 0; font-weight: bold;">
                                            Congratulations, ${username}!
                                        </h2>
                                        
                                        <p style="font-size: 16px; color: #2E8B57; margin: 0 0 30px 0; line-height: 1.6;">
                                            Your payment has been successfully processed and your <strong>${planType} Plan</strong> is now active! 
                                            Welcome to the premium Meet Beater AI experience.
                                        </p>
                                        
                                        <!-- Plan Details Box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #32CD32, #228B22); border-radius: 15px; margin: 20px 0;">
                                            <tr>
                                                <td style="padding: 25px; color: white;">
                                                    <h3 style="margin: 0 0 15px 0; font-size: 20px; text-align: center;">Your Plan Details</h3>
                                                    <table width="100%" cellpadding="5" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="font-weight: bold; width: 40%;">Plan:</td>
                                                            <td>${planType} Plan</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-weight: bold;">Price:</td>
                                                            <td>${planPrice}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-weight: bold;">Features:</td>
                                                            <td>${planFeatures}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-weight: bold;">Started:</td>
                                                            <td>${planStartDate}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-weight: bold;">Expires:</td>
                                                            <td>${planExpiryDate}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-weight: bold;">Payment ID:</td>
                                                            <td style="font-size: 12px;">${paymentId}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- What's Next Section -->
                                        <div style="background-color: rgba(255,255,255,0.8); border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #32CD32;">
                                            <h3 style="color: #2E8B57; margin: 0 0 15px 0;">What's Next?</h3>
                                            <ul style="text-align: left; color: #2E8B57; padding-left: 20px;">
                                                <li>Start uploading your meeting recordings</li>
                                                <li>Get AI-powered summaries and insights</li>
                                                <li>Export your summaries as PDF</li>
                                                <li>Enjoy priority support</li>
                                            </ul>
                                        </div>
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                            <tr>
                                                <td align="center">
                                                    <a href="http://localhost:5173/dashboard" style="display: inline-block; background: linear-gradient(135deg, #FF6347, #FF4500); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; border: 3px solid #FF4500;">
                                                        Start Using Your Plan →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="color: #2E8B57; font-size: 14px; margin: 20px 0 0 0;">
                                            Thank you for choosing Meet Beater AI! If you have any questions, feel free to contact our support team.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Social Media Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(255,255,255,0.9); border-radius: 15px; border: 2px solid #FFE5B4;" bgcolor="rgba(255,255,255,0.9)">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <h2 style="color: #2E8B57; font-size: 20px; margin: 0 0 25px 0; font-weight: bold;">
                                            Follow me im cool
                                        </h2>
                                        
                                        <!-- Social Icons -->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td align="center">
                                                    <!-- Instagram -->
                                                    <a href="https://www.instagram.com/saurabh.r23/" style="text-decoration: none; display: inline-block; margin: 0 10px;">
                                                        <div style="width: 50px; height: 50px; background: linear-gradient(45deg, #F56040, #E1306C); border-radius: 50%; display: inline-block; text-align: center; line-height: 50px; color: white; font-size: 20px; border: 2px solid #E1306C;">
                                                            📷
                                                        </div>
                                                    </a>
                                                    
                                                    <!-- Twitter/X -->
                                                    <a href="https://x.com/Saurabh_e3" style="text-decoration: none; display: inline-block; margin: 0 10px;">
                                                        <div style="width: 50px; height: 50px; background: linear-gradient(45deg, #1DA1F2, #0891B2); border-radius: 50%; display: inline-block; text-align: center; line-height: 50px; color: white; font-size: 20px; border: 2px solid #1DA1F2;">
                                                            🐦
                                                        </div>
                                                    </a>
                                                    
                                                    <!-- LinkedIn -->
                                                    <a href="https://www.linkedin.com/in/saurabh-rajmane-a67b5226b/" style="text-decoration: none; display: inline-block; margin: 0 10px;">
                                                        <div style="width: 50px; height: 50px; background: linear-gradient(45deg, #0077B5, #005885); border-radius: 50%; display: inline-block; text-align: center; line-height: 50px; color: white; font-size: 20px; border: 2px solid #0077B5;">
                                                            💼
                                                        </div>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    
    <!-- Mobile Responsive Styles -->
    <style>
        @media only screen and (max-width: 600px) {
            .mobile-center { text-align: center !important; }
            .mobile-padding { padding: 10px !important; }
            .mobile-font-size { font-size: 24px !important; }
        }
    </style>
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
