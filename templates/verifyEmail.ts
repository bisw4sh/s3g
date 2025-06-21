export const verifyEmailTemplate = (url: string) => `
          <h2>Welcome to YourApp!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link: ${url}
          </p>
        `
