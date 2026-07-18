function renderEmailFooter() {
  return `
    <tr>
      <td align="center" style="padding:22px 28px 0;">
        <p style="margin:0 0 6px;color:#7d8490;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;text-align:center;">
          This email was sent from SerhatSoruklu.com.
        </p>
        <p style="margin:0;color:#9aa1ad;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;text-align:center;">
          &copy; 2026 Serhat Soruklu. All rights reserved.
        </p>
      </td>
    </tr>`;
}

module.exports = {
  renderEmailFooter
};
