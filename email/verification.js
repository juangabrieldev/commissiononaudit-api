const verification = module.exports = (name, token) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
    <html lang="en">
    <head>
    <style>
      body {
        margin: 0; font-family: sans-serif;
      }
    </style>
    </head>
    <body style="font-family: sans-serif; margin: 0;">
        <div class="root" style="background-color: #f2f2f2; padding: 20px;">
            <div class="container" style="width: 600px; margin: 0 auto;">
                <div class="top">
                    <img src="https://i.imgur.com/F291M6j.png" alt="">
                </div>
                <div class="content" style="margin: 20px 0 0;">
                    <div class="title" style="background-color: #3268f0; border-top-left-radius: 5px; border-top-right-radius: 5px;">
                        <p style="font-size: 30px; color: white; font-weight: 600; margin: 0; padding: 50px;" align="center">Welcome to PMS!</p>
                    </div>
                    <div class="message" style="background-color: white; border-left-width: 1px; border-left-color: #e6e6e6; border-left-style: solid; border-bottom-width: 1px; border-bottom-color: #e6e6e6; border-bottom-style: solid; border-right-width: 1px; border-right-color: #e6e6e6; border-right-style: solid; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
                        <div class="image">
                            <div style="width: 150px; margin: 0 auto; padding: 70px;">
                                <img src="https://i.imgur.com/DkFNJk3.png" height="150px" alt="">
                            </div>
                        </div>
                        <div class="message-body" style="padding: 0 75px;">
                            <p class="hi" style="font-weight: 600; font-size: 25px; opacity: .8;">Hi ${name},</p>
                            <p class="desc" style="opacity: .7; font-size: 16px;">Thanks for registering. Before we get started, we need to verify this email. Copy the verification code and paste it. After this, you'll have to fill up your Personal Data Sheet.</p>
                        </div>
                        <p style="padding: 0 75px; font-size: 16px; margin-top: 25px; margin-bottom: 30px; opacity: .7">Your code: ${token}</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>`
};