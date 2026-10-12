import { describe, expect, it } from "vitest";
import { getMarketingInvitation, MARKETING_INVITATIONS } from "@/data/marketingInvitations";

describe("shareable marketing invitations", () => {
  it.each(["golden-hour", "garden-rose", "rustic-bloom", "midnight-luxe", "soft-love"])(
    "provides a published %s invitation without browser storage",
    (template) => {
      const invite = Object.values(MARKETING_INVITATIONS).find(item => item.template === template);
      expect(invite).toBeDefined();
      expect(getMarketingInvitation(invite?.id)?.template).toBe(template);
      expect(getMarketingInvitation(invite?.id)?.status).toBe("published");
      expect(invite?.story).toHaveLength(4);
      expect(invite?.schedule).toHaveLength(6);
    },
  );
  it("does not replace customer invitations or the demo route", () => {
    expect(getMarketingInvitation("invite-customer-record")).toBeNull();
    expect(getMarketingInvitation("demo-wedding")).toBeNull();
  });
});