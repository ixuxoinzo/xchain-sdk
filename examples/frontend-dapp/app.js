import { FrontendSDK } from 'xchain-sdk-full';

class SimpleDApp {
  constructor() {
    this.sdk = new FrontendSDK();
    this.init();
  }

  init() {
    document.getElementById('connectBtn').addEventListener('click', () => this.connectWallet());
    document.getElementById('transferBtn').addEventListener('click', () => this.transfer());
  }

  async connectWallet() {
    try {
      const wallet = await this.sdk.connectEVM();
      document.getElementById('walletInfo').innerHTML = `
        <p>Connected: ${wallet.address}</p>
        <p>Network: ${wallet.chain}</p>
      `;
    } catch (error) {
      alert('Please install MetaMask!');
    }
  }

  async transfer() {
    const to = document.getElementById('toAddress').value;
    const amount = document.getElementById('amount').value;
    
    try {
      const tx = await this.sdk.transferNativeEVM(to, amount);
      document.getElementById('result').innerHTML = `
        <p>Transaction sent!</p>
        <a href="${tx.explorerUrl}" target="_blank">View on Explorer</a>
      `;
    } catch (error) {
      alert('Transfer failed: ' + error.message);
    }
  }
}

new SimpleDApp();