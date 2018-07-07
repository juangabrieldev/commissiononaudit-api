const verification = module.exports = (name, token) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
    <html lang="en">
      <body style="margin:0;font-family:sans-serif;">
        <div class="root" style="background-color:#f2f2f2;padding:20px; color: black">
          <div class="container" style="margin:0 auto;width:600px;">
            <div class="top">
              <img src="https://i.imgur.com/F291M6j.png" alt="">
            </div>
            <div class="content" style="margin:20px 0;margin-bottom:0;">
              <div class="title" style="background:#3268f0;border-top-left-radius:5px;border-top-right-radius:5px;">
                <p style="text-align:center;font-size:30px;color:white;font-weight:600;padding:50px;margin:0;">Welcome to PMS!</p>
              </div>
              <div class="message" style="background:white;border-left:solid 1px #e6e6e6;border-bottom:solid 1px #e6e6e6;border-right:solid 1px #e6e6e6;border-bottom-left-radius:5px;border-bottom-right-radius:5px;">
                <div class="image">
                  <div style="width:150px;margin:0 auto;padding:70px;">
                    <img src="https://i.imgur.com/DkFNJk3.png" height="150px" alt="">
                  </div>
                </div>
                <div class="message-body" style="padding:0 75px;">
                  <p class="hi" style="font-weight:600;font-size:25px;opacity:.8;">Hi ${name},</p>
                  <p class="desc" style="opacity:.7;font-size:18px;">Thanks for registering. Before we get started, we need to verify this e-mail. After this, you have to fill up your Personal Data Sheet.</p>
                </div>
                <div class="button" style="margin:40px;margin-bottom:60px;">
                  <div style="width:120px;margin:0 auto;">
                    <a href="http://localhost:3000/get-started/verify?token=${token}" style="text-decoration:none;color:white;background:#ef7f56;padding:10px;border-radius:1px;font-size:18px;">Verify e-mail</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>`
};