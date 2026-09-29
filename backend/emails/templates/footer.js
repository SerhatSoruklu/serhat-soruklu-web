function renderEmailFooter() {
  return `
    <tr>
      <td align="center" style="padding:22px 28px 0;">
        <p style="margin:0 0 6px;color:#7d8490;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;text-align:center;">
          This email was sent from SerhatSoruklu.com.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 10px;">
          <tr>
            <td style="padding:0 5px;"><a href="https://www.linkedin.com/in/serhatsoruklu/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style="display:block;width:30px;height:30px;border:1px solid #d6a84f;border-radius:7px;color:#f0d58c;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;line-height:30px;text-align:center;text-decoration:none;">in</a></td>
            <td style="padding:0 5px;"><a href="https://x.com/SerhatSoruklu" target="_blank" rel="noopener noreferrer" aria-label="X" style="display:block;width:30px;height:30px;border:1px solid #d6a84f;border-radius:7px;color:#f0d58c;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:30px;text-align:center;text-decoration:none;">X</a></td>
            <td style="padding:0 5px;"><a href="https://www.facebook.com/SerhatSoruklu" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style="display:block;width:30px;height:30px;border:1px solid #d6a84f;border-radius:7px;color:#f0d58c;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:30px;text-align:center;text-decoration:none;">f</a></td>
            <td style="padding:0 5px;"><a href="https://www.instagram.com/Serhsoru/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="display:block;width:30px;height:30px;border:1px solid #d6a84f;border-radius:7px;color:#f0d58c;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;text-align:center;text-decoration:none;">◎</a></td>
          </tr>
        </table>
        <p style="margin:0;color:#9aa1ad;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;text-align:center;">
          &copy; 2026 Serhat Soruklu. All rights reserved.
        </p>
      </td>
    </tr>`;
}

module.exports = {
  renderEmailFooter
};
