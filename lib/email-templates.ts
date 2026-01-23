export const WelcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Lapis Platform</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
        .header { background-color: #2E5AAC; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e4e4e7; border-top: none; }
        .button { display: inline-block; background-color: #2E5AAC; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 12px; font-weight: bold; margin: 10px 0; box-shadow: 0 4px 6px -1px rgba(0, 51, 102, 0.2); }
        .button.secondary { background-color: #2c2c2c; }
        .kpi-box { background-color: #f4f4f5; border-left: 4px solid #C85A3C; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #71717a; }
        .links { margin: 25px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to the Tribe! 🚀</h1>
        </div>
        <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>Welcome to <strong>Lapis Platform</strong>—your new command center for high-performance accountability and growth. We're thrilled to have you on board.</p>
            
            <h3>What you can do here:</h3>
            <ul>
                <li>🎯 <strong>Set & Track OKRs</strong>: Align your vision with execution.</li>
                <li>🔥 <strong>Build Streaks</strong>: Use the "Pit Stop" feature for weekly reviews.</li>
                <li>🤝 <strong>Join Tribes</strong>: Collaborate and grow with accountability partners.</li>
            </ul>

            <div class="kpi-box">
                <h3>⚡ The Golden Rules of KPIs</h3>
                <ol>
                    <li><strong>Be Specific & Measurable:</strong> "Get fit" is not a KPI. "3 workouts/week" is.</li>
                    <li><strong>Weekly Pit Stops:</strong> Submit your review every week.
                        <ul>
                            <li>Late (>7 days): <strong>-5 XP Penalty</strong>.</li>
                            <li>Consistent: Earn XP and build streaks.</li>
                        </ul>
                    </li>
                    <li><strong>Action Plans:</strong> Every goal needs a concrete "Next Step".</li>
                </ol>
            </div>

            <p>Ready to get started? Access the platform wherever you are.</p>
            
            <div class="links">
                <a href="https://tracker-tribe.vercel.app/obeya" class="button">Open Desktop App</a>
                <br/><br/>
                <a href="https://tracker-tribe.vercel.app/obeya" class="button secondary">Download Mobile App (PWA)</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
                <em>Tip: For the Mobile App, open the link in Safari/Chrome on your phone and tap "Add to Home Screen".</em>
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Lapis Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const CreatorWelcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to the Creator Circle</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #fff; background-color: #000; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
        .header { background: linear-gradient(to right, #EAB308, #F97316); color: black; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background-color: #18181b; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #27272a; border-top: none; }
        .button { display: inline-block; background: linear-gradient(to right, #EAB308, #F97316); color: #000 !important; padding: 16px 32px; text-decoration: none !important; border-radius: 12px; font-weight: 900; margin: 20px 0; text-align: center; width: 80%; }
        .button.secondary { background: #27272a; color: #fff !important; border: 1px solid #3f3f46; }
        .benefit-box { background-color: #27272a; border-left: 4px solid #EAB308; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #71717a; }
        .links { margin: 25px 0; text-align: center; }
        h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; }
        h3 { color: #EAB308; margin-top: 0; }
        li { margin-bottom: 10px; color: #d4d4d8; }
        p { color: #d4d4d8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WELCOME TO THE<br/>CREATOR CIRCLE 👑</h1>
        </div>
        <div class="content">
            <p>Hi ${name || 'Lead'},</p>
            <p>You didn't just join a platform. You stepped up to lead. By securing your spot as an <strong>Early Adopter Creator</strong>, you've unlocked the highest tier of access.</p>
            
            <div class="benefit-box">
                <h3>⚡ Your Creator Privileges</h3>
                <ul style="list-style: none; padding-left: 0;">
                    <li>👑 <strong>Tribe Leadership:</strong> Create and host your own Tribes.</li>
                    <li>💰 <strong>Monetization:</strong> (Coming Soon) Turn your leadership into income.</li>
                    <li>🚀 <strong>Priority Status:</strong> Max XP boosts and direct support access.</li>
                    <li>🔒 <strong>Grand Slam Rate:</strong> You locked in this price for life.</li>
                </ul>
            </div>

            <p><strong>Your Mission Strategy:</strong></p>
            <ol style="color: #a1a1aa; padding-left: 20px;">
                <li><strong>Set Your Profile:</strong> Complete your bio so others follow you.</li>
                <li><strong>Start Your Tribe:</strong> Define the mission and invite your first members.</li>
                <li><strong>Lead by Example:</strong> Post your weekly Pit Stops.</li>
            </ol>

            <div class="links">
                <a href="https://tracker-tribe.vercel.app/obeya" class="button">🚀 Launch Dashboard</a>
                <br/><br/>
                <a href="https://tracker-tribe.vercel.app/obeya" class="button secondary">📱 Mobile App (PWA)</a>
            </div>
            
            <p style="font-size: 14px; color: #52525b; text-align: center;">
                <em>Mobile Tip: Open in Safari/Chrome > Share > "Add to Home Screen" for the full app experience.</em>
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Lapis Platform. Rise to the top.</p>
        </div>
    </div>
</body>
</html>
`;

export const TribeApplicationAdminEmail = (adminName: string, applicantName: string, tribeName: string, profileLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Tribe Application</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e4e4e7; border-top: none; }
        .button { display: inline-block; background-color: #4F46E5; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 12px; font-weight: bold; margin: 10px 0; }
        .alert-box { background-color: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; padding: 15px; margin: 20px 0; border-radius: 8px; font-size: 14px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #71717a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Application! 📬</h1>
        </div>
        <div class="content">
            <p>Hi ${adminName},</p>
            <p><strong>${applicantName}</strong> has applied to join your tribe <strong>"${tribeName}"</strong>.</p>
            
            <p>Please review their profile, stats, and badges to decide if they are a good fit for your group.</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${profileLink}" class="button">View Applicant Profile</a>
            </div>

            <div class="alert-box">
                <strong>⏳ SLA Reminder:</strong> You have <strong>15 days</strong> to accept or deny this application before it expires or affects your response rating.
            </div>

            <p>Recommended Steps:</p>
            <ul>
                <li>Review their "Grit" score and consistency.</li>
                <li>Check their badges and past achievements.</li>
                <li>Share this profile with your existing members for consensus.</li>
            </ul>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Lapis Platform. Manage your tribe.</p>
        </div>
    </div>
</body>
</html>
`;

export const TribeApplicationUserConfirmationEmail = (userName: string, tribeName: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Received</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e4e4e7; border-top: none; }
        .timeline { margin: 20px 0; padding-left: 20px; border-left: 2px solid #e5e7eb; }
        .timeline-item { position: relative; padding-bottom: 20px; padding-left: 20px; }
        .timeline-item::before { content: ''; position: absolute; left: -9px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: #e5e7eb; border: 2px solid white; }
        .timeline-item.active::before { background: #10B981; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #71717a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Sent! ✅</h1>
        </div>
        <div class="content">
            <p>Hi ${userName},</p>
            <p>Your application to join <strong>"${tribeName}"</strong> has been successfully submitted to the Tribe Admin.</p>
            
            <h3>What happens next?</h3>
            <div class="timeline">
                <div class="timeline-item active">
                    <strong>Application Received</strong><br/>
                    <span style="color: #666; font-size: 14px;">We've notified the admin.</span>
                </div>
                <div class="timeline-item">
                    <strong>Admin Review</strong><br/>
                    <span style="color: #666; font-size: 14px;">The admin reviews your profile (Stats, Grit, Badges).</span>
                </div>
                <div class="timeline-item">
                    <strong>Decision</strong><br/>
                    <span style="color: #666; font-size: 14px;">You'll receive an email with the decision within <strong>15 days</strong>.</span>
                </div>
            </div>

            <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
                While you wait, keep your stats up to impress the admin!
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Lapis Platform.</p>
        </div>
    </div>
</body>
</html>
`;
