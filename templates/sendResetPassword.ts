export const resetPasswordTemplate = (url: string) => `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to continue:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" 
               style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes.<br>
            If you didn't request this, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link: ${url}
          </p>
        `
