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
                <a href="https://lapis-platform.vercel.app/obeya" class="button">Open Desktop App</a>
                <br/><br/>
                <a href="https://lapis-platform.vercel.app/obeya" class="button secondary">Download Mobile App (PWA)</a>
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
