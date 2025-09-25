import { BannerManagement as BannerManagementComponent } from "@/components/admin/BannerManagement";

export default function BannerManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Post Ads</h1>
          <p className="text-muted-foreground">Manage banner advertisements for HR dashboard</p>
        </div>
      </div>

      <BannerManagementComponent />
    </div>
  );
}
