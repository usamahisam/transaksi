import { Body, Controller, Post } from '@nestjs/common';
import { JournalService } from './journal.service';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Journal')
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  // ============================
  // SALE
  // ============================
  @Post('sale')
  @ApiOperation({ summary: 'Create sale journal entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 50000 },
        details: { type: 'object', example: { product: 'Apple', qty: 3 } },
        userId: { type: 'string', example: 'uuid-user-123' },
      },
      required: ['amount', 'details', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Sale journal created successfully' })
  async createSale(@Body() body: any) {
    return this.journalService.createSale(body.amount, body.details, body.userId);
  }

  // ============================
  // BUY
  // ============================
  @Post('buy')
  @ApiOperation({ summary: 'Create buy journal entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 75000 },
        details: { type: 'object', example: { supplier: 'XYZ', invoice: 'INV-0012' } },
        userId: { type: 'string', example: 'uuid-user-123' },
      },
      required: ['amount', 'details', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Buy journal created successfully' })
  async createBuy(@Body() body: any) {
    return this.journalService.createBuy(body.amount, body.details, body.userId);
  }

  // ============================
  // HUTANG (AP)
  // ============================
  @Post('hutang')
  @ApiOperation({ summary: 'Create hutang (AP - Accounts Payable) entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 120000 },
        details: { type: 'object', example: { supplier: 'ABC', dueDate: '2025-01-10' } },
        userId: { type: 'string', example: 'uuid-user-999' },
      },
      required: ['amount', 'details', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Hutang created successfully' })
  async createHutang(@Body() body: any) {
    return this.journalService.createHutang(body.amount, body.details, body.userId);
  }

  // ============================
  // PIUTANG (AR)
  // ============================
  @Post('piutang')
  @ApiOperation({ summary: 'Create piutang (AR - Accounts Receivable) entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 90000 },
        details: { type: 'object', example: { customer: 'John Doe', invoice: 'INV-222' } },
        userId: { type: 'string', example: 'uuid-user-777' },
      },
      required: ['amount', 'details', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Piutang created successfully' })
  async createPiutang(@Body() body: any) {
    return this.journalService.createPiutang(body.amount, body.details, body.userId);
  }

  // ============================
  // CASH IN
  // ============================
  @Post('cash-in')
  @ApiOperation({ summary: 'Create cash-in entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100000 },
        details: { type: 'object', example: { source: 'Sales payment', method: 'Cash' } },
        userId: { type: 'string', example: 'uuid-user-555' },
      },
      required: ['amount', 'details', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Cash-In created successfully' })
  async cashIn(@Body() body: any) {
    return this.journalService.cashIn(body.amount, body.details, body.userId);
  }

  // ============================
  // CASH OUT
  // ============================
  @Post('cash-out')
  @ApiOperation({ summary: 'Create cash-out entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 45000 },
        details: { type: 'object', example: { purpose: 'Operational expense', note: 'Fuel' } },
        userId: { type: 'string', example: 'uuid-user-444' },
      },
      required: ['amount', 'details', 'userId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Cash-Out created successfully' })
  async cashOut(@Body() body: any) {
    return this.journalService.cashOut(body.amount, body.details, body.userId);
  }
}
