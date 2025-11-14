import { CampaignProductOfferView } from "./CampaignProductOfferView";

export interface CampaignGroupView {
  campaignId: string;
  campaignName: string;
  campaignCode: string;
  discountRate: number;
  productOffers: CampaignProductOfferView[];
}