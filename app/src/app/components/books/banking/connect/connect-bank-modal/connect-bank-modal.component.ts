import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BankIntegrationService, PlaidLinkConfig, YodleeFastLinkConfig, BankConnection, PlaidMetadata } from '../../../../../services/bank-integration.service';
import { take } from 'rxjs/operators';

declare global {
  interface Window {
    Plaid: any;
    fastlink: any;
  }
}

@Component({
  selector: 'app-connect-bank-modal',
  templateUrl: './connect-bank-modal.component.html',
  styleUrls: ['../../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, NgbModule]
})
export class ConnectBankModalComponent implements OnInit, OnDestroy {
  @Input() editMode = false;
  @Input() existingConnection?: BankConnection;

  loading = false;
  error: string | null = null;
  selectedProvider: 'plaid' | 'yodlee' | null = null;
  private plaidHandler: any = null;

  constructor(
    public activeModal: NgbActiveModal,
    private bankService: BankIntegrationService
  ) {}

  ngOnInit(): void {
    if (this.editMode && this.existingConnection) {
      this.selectedProvider = this.existingConnection.provider;
    }
    this.loadScripts();
  }

  ngOnDestroy(): void {
    if (this.plaidHandler) {
      this.plaidHandler.destroy();
    }
    // Remove scripts
    const scripts = document.querySelectorAll('script[data-provider]');
    scripts.forEach(script => script.remove());
  }

  private loadScripts(): void {
    // Load Plaid Link script
    const plaidScript = document.createElement('script');
    plaidScript.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    plaidScript.setAttribute('data-provider', 'plaid');
    document.head.appendChild(plaidScript);

    // Load Yodlee FastLink script
    const yodleeScript = document.createElement('script');
    yodleeScript.src = 'https://cdn.yodlee.com/fastlink/v4/initialize.js';
    yodleeScript.setAttribute('data-provider', 'yodlee');
    document.head.appendChild(yodleeScript);
  }

  selectProvider(provider: 'plaid' | 'yodlee'): void {
    this.selectedProvider = provider;
    if (provider === 'plaid') {
      this.initializePlaid();
    } else {
      this.initializeYodlee();
    }
  }

  private initializePlaid(): void {
    this.loading = true;
    this.error = null;

    this.bankService.initializePlaidLink()
      .pipe(take(1))
      .subscribe({
        next: ({ token }) => {
          const config: PlaidLinkConfig = {
            token,
            onSuccess: (publicToken, metadata) => {
              this.handlePlaidSuccess(publicToken, metadata);
            },
            onExit: (err) => {
              if (err) {
                this.error = err.message || 'Connection failed';
              }
              this.loading = false;
            },
            onEvent: (eventName, metadata) => {
              console.log('Plaid Event:', eventName, metadata);
              if (eventName === 'ERROR' && metadata.error_code) {
                this.error = `Plaid Error: ${metadata.error_code}`;
              }
            }
          };

          // Destroy existing handler if any
          if (this.plaidHandler) {
            this.plaidHandler.destroy();
          }

          this.plaidHandler = window.Plaid.create(config);
          this.plaidHandler.open();
        },
        error: (error) => {
          this.error = 'Failed to initialize Plaid connection';
          this.loading = false;
          console.error('Plaid initialization error:', error);
        }
      });
  }

  private initializeYodlee(): void {
    this.loading = true;
    this.error = null;

    this.bankService.getYodleeFastLinkToken()
      .pipe(take(1))
      .subscribe({
        next: ({ token, fastLinkUrl }) => {
          const config: YodleeFastLinkConfig = {
            fastLinkUrl,
            token,
            onSuccess: (data) => {
              this.handleYodleeSuccess(data);
            },
            onError: (error) => {
              this.error = error.message || 'Connection failed';
              this.loading = false;
            },
            onExit: () => {
              this.loading = false;
              this.activeModal.dismiss();
            }
          };

          window.fastlink.open(config);
        },
        error: (error) => {
          this.error = 'Failed to initialize Yodlee connection';
          this.loading = false;
          console.error('Yodlee initialization error:', error);
        }
      });
  }

  private handlePlaidSuccess(publicToken: string, metadata: any): void {
    const plaidMetadata: PlaidMetadata = {
      institutionId: metadata.institution.institution_id,
      institutionName: metadata.institution.name,
      accounts: metadata.accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        mask: acc.mask,
        type: acc.type,
        subtype: acc.subtype
      }))
    };

    this.bankService.exchangePlaidToken(publicToken, plaidMetadata)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.activeModal.close('success');
        },
        error: (error) => {
          this.error = 'Failed to complete bank connection';
          console.error('Plaid token exchange error:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  private handleYodleeSuccess(data: any): void {
    const { providerAccount, provider } = data;
    
    // Send Yodlee data to backend
    this.bankService.updateBankConnection(this.existingConnection?.id || 'new', {
      provider: 'yodlee',
      institutionId: provider.id,
      institutionName: provider.name,
      providerAccountId: providerAccount.id,
      status: 'connected'
    })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.activeModal.close('success');
        },
        error: (error) => {
          this.error = 'Failed to complete bank connection';
          console.error('Yodlee connection error:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  close(): void {
    this.activeModal.dismiss();
  }
}
