import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShippingQuoteDto } from './dto/shipping-quote.dto';
import { LoggiService } from './loggi.service';
import { listingWeightKg, packageSpecForListing } from './package-spec';
import { ViaCepService } from './viacep.service';

export type ShippingQuoteResponse = {
  amount: number;
  provider: string;
  source: 'loggi' | 'estimate';
  estimatedDays: number | null;
  freightTypeLabel: string | null;
  weightKg: number;
};

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly loggiService: LoggiService,
    private readonly viaCepService: ViaCepService,
  ) {}

  private parseListingLocation(location: string): { city: string; state: string } {
    const trimmed = location.trim();
    const match = trimmed.match(/^(.+?),\s*([A-Za-z]{2})$/);
    if (match) {
      return { city: match[1].trim(), state: match[2].toUpperCase() };
    }
    return { city: trimmed, state: '' };
  }

  private estimateShippingCost(params: {
    originState: string;
    destinationState: string;
    weightKg: number;
    category: string;
  }): number {
    const STATE_REGION: Record<string, string> = {
      AC: 'norte', AL: 'nordeste', AP: 'norte', AM: 'norte', BA: 'nordeste', CE: 'nordeste',
      DF: 'centro-oeste', ES: 'sudeste', GO: 'centro-oeste', MA: 'nordeste', MT: 'centro-oeste',
      MS: 'centro-oeste', MG: 'sudeste', PA: 'norte', PB: 'nordeste', PR: 'sul', PE: 'nordeste',
      PI: 'nordeste', RJ: 'sudeste', RN: 'nordeste', RS: 'sul', RO: 'norte', RR: 'norte',
      SC: 'sul', SP: 'sudeste', SE: 'nordeste', TO: 'norte',
    };
    const REMOTE_STATES = new Set(['AC', 'AM', 'RR', 'AP', 'PA', 'RO']);

    const originState = params.originState.toUpperCase();
    const destState = params.destinationState.toUpperCase();
    let multiplier = 1.7;
    if (!originState || !destState) multiplier = 1.5;
    else if (originState === destState) multiplier = 1;
    else {
      const originRegion = STATE_REGION[originState];
      const destRegion = STATE_REGION[destState];
      if (originRegion && destRegion && originRegion === destRegion) multiplier = 1.3;
      else if (REMOTE_STATES.has(destState) || REMOTE_STATES.has(originState)) multiplier = 2.15;
    }

    let bulky = 1;
    if (params.category.includes('Sistema') || params.category.includes('BASE')) bulky = 1.2;
    else if (params.category.includes('Container')) bulky = 1.12;

    const raw = (42 + params.weightKg * 7.5) * multiplier * bulky;
    return Math.max(29, Math.round(raw));
  }

  async quote(dto: ShippingQuoteDto): Promise<ShippingQuoteResponse> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });
    if (!listing || !listing.active) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    const origin = this.parseListingLocation(listing.location);
    const destinationCep = this.viaCepService.normalizeCep(dto.destinationCep);

    const destinationFromViaCep = await this.viaCepService.fetchByCep(destinationCep);
    const destination = {
      cep: destinationCep,
      city: dto.destinationCity?.trim() || destinationFromViaCep?.localidade || '',
      state: dto.destinationState?.trim().toUpperCase() || destinationFromViaCep?.uf || '',
    };

    const storedOriginCep = listing.postalCode
      ? this.viaCepService.normalizeCep(listing.postalCode)
      : '';
    let originCep = storedOriginCep.length === 8 ? storedOriginCep : null;

    if (originCep) {
      const originFromCep = await this.viaCepService.fetchByCep(originCep);
      if (originFromCep) {
        origin.city = originFromCep.localidade;
        origin.state = originFromCep.uf;
      }
    } else {
      originCep = await this.viaCepService.findCityCep(origin.state, origin.city);
      if (!originCep) {
        const fallbackCep = await this.viaCepService.findCityCep('SP', 'Sao Paulo');
        originCep = fallbackCep ?? '01310100';
        this.logger.warn(
          `Could not resolve origin CEP for listing ${listing.id} (${listing.location}); using fallback ${originCep}`,
        );
      }
    }

    const packageSpec = packageSpecForListing({
      weight: listing.weight,
      category: listing.category,
    });
    const weightKg = listingWeightKg(listing.weight, listing.category);

    if (this.loggiService.isConfigured()) {
      try {
        const loggiQuote = await this.loggiService.quote({
          origin: { cep: originCep, city: origin.city, state: origin.state },
          destination,
          packageSpec,
          goodsValue: listing.priceNum,
        });

        if (loggiQuote) {
          return {
            amount: loggiQuote.amount,
            provider: 'loggi',
            source: 'loggi',
            estimatedDays: loggiQuote.estimatedDays,
            freightTypeLabel: loggiQuote.freightTypeLabel,
            weightKg,
          };
        }
      } catch (error) {
        this.logger.warn(`Loggi quote failed for listing ${listing.id}: ${String(error)}`);
      }
    }

    const estimatedAmount = this.estimateShippingCost({
      originState: origin.state,
      destinationState: destination.state,
      weightKg,
      category: listing.category,
    });

    return {
      amount: estimatedAmount,
      provider: 'estimate',
      source: 'estimate',
      estimatedDays: null,
      freightTypeLabel: null,
      weightKg,
    };
  }
}
