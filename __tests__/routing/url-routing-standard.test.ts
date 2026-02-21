import nextConfig from "../../next.config";

describe("URL routing standard", () => {
  it("defines canonical redirects from legacy Turkish paths", async () => {
    expect(typeof nextConfig.redirects).toBe("function");

    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    const matrix = (redirects ?? []).map((item) => ({
      source: item.source,
      destination: item.destination,
      permanent: item.permanent,
    }));

    expect(matrix).toEqual(
      expect.arrayContaining([
        {
          source: "/dersler",
          destination: "/courses",
          permanent: true,
        },
        {
          source: "/dersler/:path*",
          destination: "/courses/:path*",
          permanent: true,
        },
        {
          source: "/hocalar",
          destination: "/professors",
          permanent: true,
        },
        {
          source: "/hocalar/:path*",
          destination: "/professors/:path*",
          permanent: true,
        },
      ])
    );
  });
});
