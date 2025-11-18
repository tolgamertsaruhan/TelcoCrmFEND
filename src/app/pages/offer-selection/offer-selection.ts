import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin, of, switchMap } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { GetListCatalogResponse } from '../../models/catalogmodels/GetListCatalogResponse';
import { CatalogProductOfferView } from '../../models/catalogmodels/CatalogProductOfferView';
import { GetListCampaignResponse } from '../../models/catalogmodels/GetListCampaignResponse';
import { CampaignGroupView } from '../../models/catalogmodels/CampaignGroupView';
import { Basket } from '../../models/basketmodels/Basket';
import { CatalogService } from '../../services/catalog-service';
import { CampaignService } from '../../services/campaign-service';
import { ProductOfferService } from '../../services/product-offer-service';
import { BasketService } from '../../services/basket-service';
import { BasketItem } from '../../models/basketmodels/BasketItem';
import { BackgroundItem } from "../../components/background-item/background-item";

interface CampaignBasketGroup {
  campaignId: string;
  campaignName: string;
  discountRate: number;
  quantity: number;
  totalPrice: number;
  items: BasketItem[];
}

@Component({
  selector: 'app-offer-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, BackgroundItem],
  templateUrl: './offer-selection.html',
  styleUrl: './offer-selection.scss'
})
export class OfferSelectionComponent implements OnInit, AfterViewInit {

  billingAccountId!: string;

  activeTab: 'catalog' | 'campaign' = 'catalog';

  catalogs: GetListCatalogResponse[] = [];
  selectedCatalogId: string | null = null;
  catalogProductOfferName: string = '';
  catalogResults: CatalogProductOfferView[] = [];
  isCatalogLoading = false;

  campaigns: GetListCampaignResponse[] = [];
  selectedCampaignId: string | null = null;
  campaignProductOfferName: string = '';
  campaignGroup: CampaignGroupView | null = null;
  isCampaignLoading = false;

  basket: Basket | null = null;
  isBasketLoading = false;

  groupedCampaigns: CampaignBasketGroup[] = [];
  normalProducts: BasketItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private campaignService: CampaignService,
    private productOfferService: ProductOfferService,
    private basketService: BasketService,
    private cdr: ChangeDetectorRef
  ) {}

  //---------------------------------------------------
  // LIFECYCLE
  //---------------------------------------------------
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['billingAccountId'];

      if (!id) {
        this.router.navigate(['/billing-accounts']);
        return;
      }

      this.billingAccountId = id;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadInitialData();
    });
  }

  private loadInitialData(): void {
    this.loadCatalogs();
    this.loadCampaigns();
  }

  //---------------------------------------------------
  // CATALOG TAB
  //---------------------------------------------------
  private loadCatalogs(): void {
    this.catalogService.getAllCatalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs.filter(c => c.parentId !== null);
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  onCatalogSearch(): void {
    if (!this.selectedCatalogId) return;

    this.isCatalogLoading = true;
    this.catalogResults = [];

    const catalogId = this.selectedCatalogId!;
    const name = (this.catalogProductOfferName || '').trim();

    let list$;

    if (!name) {
      list$ = this.catalogService.getProductOffersByCatalogId(catalogId);
    } else {
      list$ = this.catalogService.searchProductOffersByCatalogIdAndName(catalogId, name);
    }

    list$
      .pipe(
        switchMap(list => {
          if (list.length === 0) return of([]);

          const reqs = list.map(item =>
            this.productOfferService.getProductOffer(item.productOfferId)
          );

          return forkJoin(reqs);
        })
      )
      .subscribe({
        next: (offers) => {
          this.catalogResults = offers.map(po => ({
            productOfferId: po.id,
            productOfferName: po.name,
            price: po.price
          }));

          this.isCatalogLoading = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(err);
          this.isCatalogLoading = false;
        }
      });
  }

  addCatalogProductOfferToBasket(productOfferId: string): void {
    this.basketService
      .addToBasket(this.billingAccountId, productOfferId, null)
      .subscribe({
        next: () => this.loadBasket(),
        error: err => console.error(err)
      });
  }

  //---------------------------------------------------
  // CAMPAIGN TAB
  //---------------------------------------------------
  private loadCampaigns(): void {
    this.campaignService.getAllCampaigns().subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns;
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  onCampaignSearch(): void {
    if (!this.selectedCampaignId) return;

    this.isCampaignLoading = true;
    this.campaignGroup = null;

    const campaignId = this.selectedCampaignId!;
    const name = (this.campaignProductOfferName || '').trim();

    let list$;

    if (!name) {
      list$ = this.campaignService.getCampaignProductOffersByCampaignId(campaignId);
    } else {
      list$ = this.campaignService.searchCampaignProductOffers(campaignId, name);
    }

    list$
      .pipe(
        switchMap(list => {
          if (list.length === 0)
            return of({ campaign: null, productOffers: [] });

          const campaignReq = this.campaignService.getCampaignById(campaignId);
          const offerReqs = list.map(item =>
            this.productOfferService.getProductOffer(item.productOfferId)
          );

          return forkJoin({
            campaign: campaignReq,
            productOffers: forkJoin(offerReqs)
          });
        })
      )
      .subscribe({
        next: result => {
          if (result.campaign) {
            this.campaignGroup = {
              campaignId: result.campaign.id,
              campaignName: result.campaign.name,
              campaignCode: result.campaign.campaignCode,
              discountRate: result.campaign.discountRate,
              productOffers: result.productOffers.map(po => ({
                productOfferId: po.id,
                productOfferName: po.name,
                price: po.price
              }))
            };
          }

          this.isCampaignLoading = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(err);
          this.isCampaignLoading = false;
        }
      });
  }

  addCampaignToBasket(campaignId: string): void {
    this.basketService
      .addToBasket(this.billingAccountId, null, campaignId)
      .subscribe({
        next: () => this.loadBasket(),
        error: err => console.error(err)
      });
  }

  //---------------------------------------------------
  // BASKET
  //---------------------------------------------------
  private loadBasket(): void {
    this.isBasketLoading = true;

    this.basketService.getBasketByBillingAccountId(this.billingAccountId)
      .subscribe({
        next: basket => {
          this.basket = basket;
          this.isBasketLoading = false;
          this.groupBasketItems();
        },
        error: err => {
          console.error(err);
          this.isBasketLoading = false;
        }
      });
  }

  //---------------------------------------------------
  // GROUPING LOGIC (DÜZELTİLDİ)
  //---------------------------------------------------
  private groupBasketItems(): void {
    if (!this.basket) {
      this.groupedCampaigns = [];
      this.normalProducts = [];
      this.cdr.detectChanges();
      return;
    }

    const campaignMap: { [id: string]: CampaignBasketGroup } = {};
    const normals: BasketItem[] = [];

    // CRITICAL FIX:
    // Eğer ürünün campaignProductOfferId yoksa → bu Catalog ürünüdür.
    // Catalog ürünleri campaign grubuna ASLA girmemeli.
    for (const item of this.basket.basketItems) {
      if (!item.campaignProductOfferId) {
        item.campaignId = null;
        item.campaignProductOfferId = '';
      }
    }

    for (const item of this.basket.basketItems) {

      // Artık sadece gerçek kampanya bundle itemleri buraya girer
      if (item.campaignId && item.campaignProductOfferId) {

        const cid = item.campaignId;

        if (!campaignMap[cid]) {
          campaignMap[cid] = {
            campaignId: cid,
            campaignName: '',
            discountRate: item.discountRate ?? 0,
            quantity: 0,
            totalPrice: 0,
            items: []
          };
        }

        const group = campaignMap[cid];
        group.items.push(item);

        group.quantity = Math.max(group.quantity, item.quantity ?? 1);

        const unitPrice = item.discountedPrice ?? item.price;
        group.totalPrice += unitPrice * (item.quantity ?? 1);

      } else {
        // Catalog item → normalProducts
        normals.push(item);
      }
    }

    this.normalProducts = normals;

    const groupsArray = Object.values(campaignMap);

    if (groupsArray.length === 0) {
      this.groupedCampaigns = [];
      this.cdr.detectChanges();
      return;
    }

    // Campaign adlarını çek
    const ids = groupsArray.map(g => g.campaignId);

    forkJoin(ids.map(id => this.campaignService.getCampaignById(id)))
      .subscribe({
        next: campaigns => {
          const cmap: { [id: string]: any } = {};
          campaigns.forEach(c => cmap[c.id] = c);

          groupsArray.forEach(group => {
            const c = cmap[group.campaignId];
            if (c) {
              group.campaignName = c.name;
            }
          });

          this.groupedCampaigns = groupsArray;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(err);
          this.groupedCampaigns = groupsArray;
          
          this.cdr.detectChanges();
        }
      });
  }

  //---------------------------------------------------
  // ACTIONS
  //---------------------------------------------------
  incrementCampaignGroup(group: CampaignBasketGroup): void {
    this.addCampaignToBasket(group.campaignId);
  }

  decrementCampaignGroup(group: CampaignBasketGroup): void {
    if (!group.items || group.items.length === 0) return;

    const removeCalls = group.items.map(item =>
      this.basketService.removeFromBasket(
        this.billingAccountId,
        item.productOfferId,
        item.campaignId
      )
    );

    forkJoin(removeCalls).subscribe({
      next: () => this.loadBasket(),
      error: err => console.error(err)
    });
  }

  incrementItem(item: BasketItem): void {
    if (item.productOfferId) {
      this.addCatalogProductOfferToBasket(item.productOfferId);
    }
  }

  decrementItem(item: BasketItem): void {
    this.basketService
      .removeFromBasket(this.billingAccountId, item.productOfferId, null)
      .subscribe({
        next: () => this.loadBasket(),
        error: err => console.error(err)
      });
  }

  clearBasket(): void {
    this.basketService.clearBasket(this.billingAccountId).subscribe({
      next: () => this.loadBasket(),
      error: err => console.error(err)
    });
  }

  getItemDisplayPrice(item: BasketItem): number {
    return item.discountedPrice ?? item.price;
  }

  //---------------------------------------------------
  // NEW: NEXT BUTTON ACTION
  //---------------------------------------------------
  goToConfiguration(): void {
    this.router.navigate(['/configuration-product'], {
      queryParams: {
        billingAccountId: this.billingAccountId
      }
    });
  }
}
