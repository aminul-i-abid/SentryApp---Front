import { WhatsappLogDto } from './WhatsappLogDto';

export interface PaginatedWhatsappLogsDto {
    items: WhatsappLogDto[];
    totalCount: number;
}