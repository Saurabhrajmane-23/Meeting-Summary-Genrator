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

const sendEmail = async (
  to,
  subject,
  text,
  username = "",
  verificationCode = ""
) => {
  try {
    // Generate the HTML content with dynamic values
    const htmlContent = createEmailTemplate(username, verificationCode);

    await transporter.sendMail({
      from: "meetbeater23@gmail.com",
      to,
      subject,
      text,
      html: htmlContent,
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
