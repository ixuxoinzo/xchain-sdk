import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, TransactionInstruction, ComputeBudgetProgram, StakeProgram } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, getMint, createMintToInstruction, createInitializeMintInstruction, createBurnInstruction, createCloseAccountInstruction, createApproveInstruction, createRevokeInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, MINT_SIZE, getMinimumBalanceForRentExemptMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from '@metaplex-foundation/js';
import bs58 from 'bs58';
import { CHAINS } from './chains.js';
export class SolanaSDK {
    constructor(privateKey, customRpcUrl, commitment = 'confirmed') {
        this.metaplex = null;
        this.commitment = 'confirmed';
        // Handle multiple input types
        if (typeof privateKey === 'object' && 'mnemonic' in privateKey) {
            // Handle mnemonic + path
            const seed = this.deriveSeedFromMnemonic(privateKey.mnemonic, privateKey.path);
            this.keypair = Keypair.fromSeed(seed);
        }
        else if (typeof privateKey === 'string') {
            // Handle base58 private key string
            this.keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        }
        else {
            // Handle Uint8Array private key
            this.keypair = Keypair.fromSecretKey(privateKey);
        }
        const rpcUrl = customRpcUrl || CHAINS.SOLANA.rpc;
        this.connection = new Connection(rpcUrl, commitment);
        this.commitment = commitment;
        // Initialize Metaplex for NFT operations
        this.initializeMetaplex();
    }
    deriveSeedFromMnemonic(mnemonic, path) {
        // Simple derivation for Solana - in production use proper HD wallet
        const derivationString = mnemonic + (path || 'solana');
        const seed = bs58.encode(Buffer.from(derivationString));
        return Buffer.from(seed).subarray(0, 32);
    }
    initializeMetaplex() {
        try {
            this.metaplex = Metaplex.make(this.connection)
                .use(keypairIdentity(this.keypair))
                .use(bundlrStorage({
                address: 'https://node1.bundlr.network',
                providerUrl: this.connection.rpcEndpoint,
                timeout: 60000,
            }));
        }
        catch (error) {
            console.warn('Metaplex initialization failed, NFT operations may be limited:', error);
        }
    }
    // ========== WALLET MANAGEMENT ==========
    static createRandom() {
        const keypair = Keypair.generate();
        return {
            address: keypair.publicKey.toString(),
            privateKey: bs58.encode(keypair.secretKey),
            publicKey: keypair.publicKey.toString()
        };
    }
    static fromMnemonic(mnemonic, path) {
        const seed = bs58.encode(Buffer.from(mnemonic + (path || 'solana')));
        const keypair = Keypair.fromSeed(Buffer.from(seed).subarray(0, 32));
        return {
            address: keypair.publicKey.toString(),
            privateKey: bs58.encode(keypair.secretKey),
            publicKey: keypair.publicKey.toString()
        };
    }
    getAddress() {
        return this.keypair.publicKey.toString();
    }
    getPublicKey() {
        return this.keypair.publicKey;
    }
    getKeypair() {
        return this.keypair;
    }
    async getBalance(address) {
        const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
        const balance = await this.connection.getBalance(pubkey);
        return balance / LAMPORTS_PER_SOL;
    }
    async getBalanceLamports(address) {
        const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
        return await this.connection.getBalance(pubkey);
    }
    // ========== NATIVE SOL OPERATIONS ==========
    async transferSOL(to, amount, options = {}) {
        try {
            const toPubkey = new PublicKey(to);
            const transaction = new Transaction();
            // Add compute budget instructions if specified
            if (options.computeUnitPrice) {
                transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: options.computeUnitPrice
                }));
            }
            if (options.computeUnitLimit) {
                transaction.add(ComputeBudgetProgram.setComputeUnitLimit({
                    units: options.computeUnitLimit
                }));
            }
            // Add transfer instruction
            transaction.add(SystemProgram.transfer({
                fromPubkey: this.keypair.publicKey,
                toPubkey: toPubkey,
                lamports: amount * LAMPORTS_PER_SOL,
            }));
            // Add memo if provided
            if (options.memo) {
                transaction.add(new TransactionInstruction({
                    keys: [{ pubkey: this.keypair.publicKey, isSigner: true, isWritable: true }],
                    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    data: Buffer.from(options.memo, 'utf8')
                }));
            }
            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
                commitment: this.commitment,
                skipPreflight: true
            });
            // Get transaction confirmation
            const confirmation = await this.connection.confirmTransaction({
                signature,
                blockhash: transaction.recentBlockhash,
                lastValidBlockHeight: transaction.lastValidBlockHeight
            }, this.commitment);
            return {
                signature,
                from: this.keypair.publicKey.toString(),
                to,
                amount,
                lamports: amount * LAMPORTS_PER_SOL,
                slot: confirmation.context.slot,
                blockTime: Date.now() / 1000,
                confirmationStatus: 'confirmed'
            };
        }
        catch (error) {
            throw new Error(`SOL transfer failed: ${error.message}`);
        }
    }
    async transferSOLToMultiple(recipients, options = {}) {
        const transactions = [];
        for (const recipient of recipients) {
            try {
                const result = await this.transferSOL(recipient.to, recipient.amount, options);
                transactions.push(result);
            }
            catch (error) {
                transactions.push({
                    signature: '',
                    from: this.keypair.publicKey.toString(),
                    to: recipient.to,
                    amount: recipient.amount,
                    lamports: recipient.amount * LAMPORTS_PER_SOL,
                    slot: 0,
                    blockTime: 0,
                    confirmationStatus: 'processed',
                    error: error.message
                });
            }
        }
        return transactions;
    }
    async airdrop(amount = 1, address) {
        const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
        const signature = await this.connection.requestAirdrop(pubkey, amount * LAMPORTS_PER_SOL);
        await this.connection.confirmTransaction(signature, this.commitment);
        return signature;
    }
    // ========== SPL TOKEN OPERATIONS ==========
    async transferSPLToken(mint, to, amount, options = {}) {
        try {
            const mintPubkey = new PublicKey(mint);
            const toPubkey = new PublicKey(to);
            const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);
            const transaction = new Transaction();
            // Add compute budget instructions if specified
            if (options.computeUnitPrice) {
                transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: options.computeUnitPrice
                }));
            }
            if (options.computeUnitLimit) {
                transaction.add(ComputeBudgetProgram.setComputeUnitLimit({
                    units: options.computeUnitLimit
                }));
            }
            // Create token account if doesn't exist
            try {
                await getAccount(this.connection, toTokenAccount);
            }
            catch {
                transaction.add(createAssociatedTokenAccountInstruction(this.keypair.publicKey, toTokenAccount, toPubkey, mintPubkey));
            }
            // Get token decimals if not provided
            let decimals = options.decimals;
            if (!decimals) {
                const mintInfo = await getMint(this.connection, mintPubkey);
                decimals = mintInfo.decimals;
            }
            const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));
            // Add transfer instruction
            transaction.add(createTransferInstruction(fromTokenAccount, toTokenAccount, this.keypair.publicKey, adjustedAmount));
            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
                commitment: this.commitment,
                skipPreflight: true
            });
            const slot = await this.connection.getSlot(this.commitment);
            return {
                signature,
                from: this.keypair.publicKey.toString(),
                to,
                mint,
                amount,
                decimals: decimals,
                slot
            };
        }
        catch (error) {
            throw new Error(`SPL token transfer failed: ${error.message}`);
        }
    }
    async getTokenBalance(mint, address) {
        try {
            const mintPubkey = new PublicKey(mint);
            const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
            const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
            const accountInfo = await getAccount(this.connection, tokenAccount);
            const mintInfo = await getMint(this.connection, mintPubkey);
            return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
        }
        catch {
            return 0;
        }
    }
    async getTokenBalanceLamports(mint, address) {
        try {
            const mintPubkey = new PublicKey(mint);
            const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
            const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
            const accountInfo = await getAccount(this.connection, tokenAccount);
            return accountInfo.amount;
        }
        catch {
            return BigInt(0);
        }
    }
    async getTokenInfo(mint) {
        const mintPubkey = new PublicKey(mint);
        const mintInfo = await getMint(this.connection, mintPubkey);
        const balance = await this.getTokenBalance(mint);
        let name = 'Unknown Token';
        let symbol = 'UNKNOWN';
        if (this.metaplex) {
            try {
                const metadata = await this.metaplex.nfts().findByMint({ mintAddress: mintPubkey });
                name = metadata.name;
                symbol = metadata.symbol;
            }
            catch (error) {
                // Metadata not available
            }
        }
        return {
            address: mint,
            symbol,
            name,
            decimals: mintInfo.decimals,
            totalSupply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toString(),
            balance: balance.toString()
        };
    }
    async createToken(decimals = 9, options = {}) {
        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(this.connection);
        const transaction = new Transaction();
        // Add compute budget if specified
        if (options.computeUnitPrice) {
            transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: options.computeUnitPrice
            }));
        }
        transaction.add(SystemProgram.createAccount({
            fromPubkey: this.keypair.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
        }));
        transaction.add(createInitializeMintInstruction(mintKeypair.publicKey, decimals, options.mintAuthority || this.keypair.publicKey, options.freezeAuthority || this.keypair.publicKey));
        await sendAndConfirmTransaction(this.connection, transaction, [this.keypair, mintKeypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return mintKeypair.publicKey.toString();
    }
    async mintTokens(mint, to, amount, options = {}) {
        const mintPubkey = new PublicKey(mint);
        const toPubkey = new PublicKey(to);
        const tokenAccount = await getOrCreateAssociatedTokenAccount(this.connection, this.keypair, mintPubkey, toPubkey);
        const mintInfo = await getMint(this.connection, mintPubkey);
        const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));
        const transaction = new Transaction();
        // Add compute budget if specified
        if (options.computeUnitPrice) {
            transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: options.computeUnitPrice
            }));
        }
        transaction.add(createMintToInstruction(mintPubkey, tokenAccount.address, this.keypair.publicKey, adjustedAmount));
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return signature;
    }
    async burnTokens(mint, amount, options = {}) {
        const mintPubkey = new PublicKey(mint);
        const tokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);
        const mintInfo = await getMint(this.connection, mintPubkey);
        const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));
        const transaction = new Transaction();
        // Add compute budget if specified
        if (options.computeUnitPrice) {
            transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: options.computeUnitPrice
            }));
        }
        transaction.add(createBurnInstruction(tokenAccount, mintPubkey, this.keypair.publicKey, adjustedAmount));
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return signature;
    }
    async approveToken(mint, delegate, amount, options = {}) {
        const mintPubkey = new PublicKey(mint);
        const delegatePubkey = new PublicKey(delegate);
        const tokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);
        const mintInfo = await getMint(this.connection, mintPubkey);
        const adjustedAmount = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));
        const transaction = new Transaction();
        // Add compute budget if specified
        if (options.computeUnitPrice) {
            transaction.add(ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: options.computeUnitPrice
            }));
        }
        transaction.add(createApproveInstruction(tokenAccount, delegatePubkey, this.keypair.publicKey, adjustedAmount));
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return signature;
    }
    async revokeTokenApproval(mint, delegate) {
        const mintPubkey = new PublicKey(mint);
        const delegatePubkey = new PublicKey(delegate);
        const tokenAccount = await getAssociatedTokenAddress(mintPubkey, this.keypair.publicKey);
        const transaction = new Transaction();
        transaction.add(createRevokeInstruction(tokenAccount, this.keypair.publicKey));
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return signature;
    }
    // ========== NFT OPERATIONS ==========
    async createNFT(metadata, options = {}) {
        if (!this.metaplex) {
            throw new Error('Metaplex not initialized. NFT operations require Metaplex.');
        }
        try {
            let imageFile;
            if (typeof metadata.image === 'string') {
                imageFile = metadata.image;
            }
            else {
                imageFile = toMetaplexFile(await this.fileToBuffer(metadata.image), 'image.png');
            }
            const { nft, response } = await this.metaplex.nfts().create({
                uri: "",
                name: metadata.name,
                symbol: metadata.symbol,
                sellerFeeBasisPoints: metadata.seller_fee_basis_points || 0,
                creators: options.creators || [
                    {
                        address: this.keypair.publicKey,
                        share: 100,
                    },
                ],
                isMutable: options.isMutable !== false,
                collection: options.collection || null,
            });
            const { uri } = await this.metaplex.nfts().uploadMetadata({
                name: metadata.name,
                symbol: metadata.symbol,
                description: metadata.description,
                image: imageFile,
                attributes: metadata.attributes,
                external_url: metadata.external_url,
                properties: {
                    files: [
                        {
                            uri: imageFile,
                            type: 'image/png',
                        },
                    ],
                },
            });
            await this.metaplex.nfts().update({
                nftOrSft: nft,
                uri: uri,
            });
            return {
                mint: nft.address.toString(),
                signature: response.signature,
                metadataUri: uri,
                metadata: {
                    name: nft.name,
                    symbol: nft.symbol,
                    uri: nft.uri,
                    sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
                    creators: nft.creators,
                    primarySaleHappened: nft.primarySaleHappened,
                    isMutable: nft.isMutable,
                    editionNonce: nft.editionNonce,
                    tokenStandard: nft.tokenStandard,
                    collection: nft.collection,
                }
            };
        }
        catch (error) {
            throw new Error(`NFT creation failed: ${error.message}`);
        }
    }
    async fileToBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    resolve(Buffer.from(reader.result));
                }
                else {
                    reject(new Error('Failed to read file'));
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    async transferNFT(mint, to) {
        return await this.transferSPLToken(mint, to, 1);
    }
    async getNFTsByOwner(owner) {
        if (!this.metaplex) {
            throw new Error('Metaplex not initialized');
        }
        const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;
        const nfts = await this.metaplex.nfts().findAllByOwner({ owner: ownerPubkey });
        const nftInfos = [];
        for (const nft of nfts) {
            if (nft.model === 'metadata') {
                try {
                    const fullNft = await this.metaplex.nfts().findByMint({ mintAddress: nft.mintAddress });
                    const nftJson = fullNft.json;
                    nftInfos.push({
                        contractAddress: nft.mintAddress.toString(),
                        tokenId: 0,
                        owner: ownerPubkey.toString(),
                        tokenURI: nft.uri,
                        name: nft.name,
                        symbol: nft.symbol || '',
                        image: nftJson?.image || '',
                        description: nftJson?.description || '',
                        attributes: nftJson?.attributes || []
                    });
                }
                catch (error) {
                    continue;
                }
            }
        }
        return nftInfos;
    }
    async getNFTMetadata(mint) {
        if (!this.metaplex) {
            throw new Error('Metaplex not initialized');
        }
        const mintPubkey = new PublicKey(mint);
        const nft = await this.metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        // FIX: Convert TokenStandard to string
        const tokenStandard = nft.tokenStandard ? nft.tokenStandard.__kind || nft.tokenStandard.toString() : undefined;
        // FIX: Safe useMethod conversion
        let useMethod;
        if (nft.uses) {
            const method = nft.uses.useMethod;
            if (method === 'burn' || method === 'multiple' || method === 'single') {
                useMethod = method;
            }
            else if (typeof method === 'string') {
                useMethod = method;
            }
        }
        return {
            mint: nft.address.toString(),
            name: nft.name,
            symbol: nft.symbol,
            uri: nft.uri,
            sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
            creators: nft.creators.map(creator => ({
                address: creator.address.toString(),
                verified: creator.verified,
                share: creator.share
            })),
            primarySaleHappened: nft.primarySaleHappened,
            isMutable: nft.isMutable,
            editionNonce: nft.editionNonce || undefined,
            tokenStandard: tokenStandard,
            collection: nft.collection ? {
                verified: nft.collection.verified,
                key: nft.collection.address.toString()
            } : undefined,
            uses: nft.uses ? {
                useMethod: useMethod,
                remaining: nft.uses.remaining,
                total: nft.uses.total
            } : undefined
        };
    }
    async updateNFTMetadata(mint, updates) {
        if (!this.metaplex) {
            throw new Error('Metaplex not initialized');
        }
        const mintPubkey = new PublicKey(mint);
        const nft = await this.metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        const { response } = await this.metaplex.nfts().update({
            nftOrSft: nft,
            name: updates.name,
            symbol: updates.symbol,
            uri: updates.uri,
            sellerFeeBasisPoints: updates.sellersFeeBasisPoints,
            creators: updates.creators,
            isMutable: updates.isMutable,
        });
        return response.signature;
    }
    // ========== ACCOUNT MANAGEMENT ==========
    async getAccountInfo(address) {
        const pubkey = new PublicKey(address);
        const accountInfo = await this.connection.getAccountInfo(pubkey);
        if (!accountInfo) {
            throw new Error('Account not found');
        }
        return {
            address,
            lamports: accountInfo.lamports,
            owner: accountInfo.owner.toString(),
            executable: accountInfo.executable,
            data: accountInfo.data,
            rentEpoch: accountInfo.rentEpoch
        };
    }
    async getTokenAccounts(address) {
        const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
        const tokenAccounts = await this.connection.getTokenAccountsByOwner(ownerPubkey, { programId: TOKEN_PROGRAM_ID });
        const accounts = [];
        for (const account of tokenAccounts.value) {
            try {
                const accountInfo = await getAccount(this.connection, account.pubkey);
                const mintInfo = await getMint(this.connection, accountInfo.mint);
                accounts.push({
                    address: account.pubkey.toString(),
                    mint: accountInfo.mint.toString(),
                    owner: accountInfo.owner.toString(),
                    amount: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals),
                    decimals: mintInfo.decimals,
                    state: accountInfo.isInitialized ?
                        (accountInfo.isFrozen ? 'frozen' : 'initialized') :
                        'uninitialized'
                });
            }
            catch (error) {
                continue;
            }
        }
        return accounts;
    }
    async getProgramAccounts(programId, filters) {
        const programPubkey = new PublicKey(programId);
        const accounts = await this.connection.getProgramAccounts(programPubkey, {
            filters,
            commitment: this.commitment
        });
        return accounts.map(account => ({
            pubkey: account.pubkey.toString(),
            account: {
                executable: account.account.executable,
                owner: account.account.owner.toString(),
                lamports: account.account.lamports,
                data: account.account.data,
                rentEpoch: account.account.rentEpoch
            }
        }));
    }
    async createAssociatedTokenAccount(mint, owner) {
        const mintPubkey = new PublicKey(mint);
        const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;
        const transaction = new Transaction();
        const associatedTokenAddress = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
        transaction.add(createAssociatedTokenAccountInstruction(this.keypair.publicKey, associatedTokenAddress, ownerPubkey, mintPubkey));
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return signature;
    }
    async closeTokenAccount(mint, address) {
        const mintPubkey = new PublicKey(mint);
        const ownerPubkey = address ? new PublicKey(address) : this.keypair.publicKey;
        const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
        const transaction = new Transaction();
        transaction.add(createCloseAccountInstruction(tokenAccount, this.keypair.publicKey, this.keypair.publicKey));
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return signature;
    }
    // ========== TRANSACTION OPERATIONS ==========
    async getTransaction(signature) {
        const tx = await this.connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: this.commitment
        });
        if (!tx) {
            throw new Error('Transaction not found');
        }
        const memoInstruction = tx.transaction.message.compiledInstructions.find(ix => {
            const programId = tx.transaction.message.staticAccountKeys[ix.programIdIndex];
            return programId.toString() === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
        });
        return {
            signature: tx.transaction.signatures[0],
            slot: tx.slot,
            blockTime: tx.blockTime || 0,
            confirmationStatus: 'confirmed',
            err: tx.meta?.err || null,
            memo: memoInstruction ? Buffer.from(memoInstruction.data).toString('utf8') : undefined,
            instructions: tx.transaction.message.compiledInstructions.map(ix => ({
                programId: tx.transaction.message.staticAccountKeys[ix.programIdIndex].toString(),
                accounts: ix.accountKeyIndexes.map(idx => tx.transaction.message.staticAccountKeys[idx].toString()),
                data: Buffer.from(ix.data).toString('base64')
            }))
        };
    }
    async getRecentTransactions(limit = 10, address) {
        const pubkey = address ? new PublicKey(address) : this.keypair.publicKey;
        const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit });
        const transactions = await Promise.all(signatures.map(sig => this.getTransaction(sig.signature).catch(() => null)));
        return transactions.filter(tx => tx !== null);
    }
    async signTransaction(transaction) {
        transaction.partialSign(this.keypair);
        return transaction;
    }
    async sendTransaction(transaction, signers = []) {
        signers.push(this.keypair);
        return await sendAndConfirmTransaction(this.connection, transaction, signers, {
            commitment: this.commitment,
            skipPreflight: true
        });
    }
    async simulateTransaction(transaction) {
        return await this.connection.simulateTransaction(transaction);
    }
    // ========== STAKE OPERATIONS ==========
    async createStakeAccount(amount, validator) {
        const stakeAccount = Keypair.generate();
        const validatorPubkey = new PublicKey(validator);
        const transaction = new Transaction();
        transaction.add(SystemProgram.createAccount({
            fromPubkey: this.keypair.publicKey,
            newAccountPubkey: stakeAccount.publicKey,
            lamports: await this.connection.getMinimumBalanceForRentExemption(StakeProgram.space),
            space: StakeProgram.space,
            programId: StakeProgram.programId,
        }));
        transaction.add(StakeProgram.initialize({
            stakePubkey: stakeAccount.publicKey,
            authorized: {
                staker: this.keypair.publicKey,
                withdrawer: this.keypair.publicKey,
            },
        }));
        transaction.add(StakeProgram.delegate({
            stakePubkey: stakeAccount.publicKey,
            authorizedPubkey: this.keypair.publicKey,
            votePubkey: validatorPubkey,
        }));
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair, stakeAccount], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return signature;
    }
    async getStakeAccounts(owner) {
        const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;
        const stakeAccounts = await this.connection.getParsedProgramAccounts(StakeProgram.programId, {
            filters: [
                {
                    memcmp: {
                        offset: 12,
                        bytes: ownerPubkey.toBase58(),
                    },
                },
            ],
        });
        const accounts = [];
        for (const account of stakeAccounts) {
            const parsed = account.account.data;
            if (parsed.program === 'stake' && parsed.parsed.type === 'delegated') {
                const info = parsed.parsed.info;
                accounts.push({
                    address: account.pubkey.toString(),
                    balance: account.account.lamports / LAMPORTS_PER_SOL,
                    stake: parseInt(info.stake.delegation.stake) / LAMPORTS_PER_SOL,
                    rewards: 0,
                    activationEpoch: parseInt(info.stake.delegation.activationEpoch),
                    deactivationEpoch: parseInt(info.stake.delegation.deactivationEpoch),
                    voter: info.stake.delegation.voter,
                });
            }
        }
        return accounts;
    }
    // ========== NETWORK INFORMATION ==========
    async getRecentBlockhash() {
        const { blockhash } = await this.connection.getLatestBlockhash(this.commitment);
        return blockhash;
    }
    async getSlot() {
        return await this.connection.getSlot(this.commitment);
    }
    async getEpochInfo() {
        return await this.connection.getEpochInfo();
    }
    async getVersion() {
        return await this.connection.getVersion();
    }
    async getGenesisHash() {
        return await this.connection.getGenesisHash();
    }
    async getSupply() {
        return await this.connection.getSupply();
    }
    async getInflationReward(addresses, epoch) {
        const pubkeys = addresses.map(addr => new PublicKey(addr));
        return await this.connection.getInflationReward(pubkeys, epoch);
    }
    async getLeaderSchedule(epoch) {
        return await this.connection.getLeaderSchedule();
    }
    async getVoteAccounts() {
        const voteAccounts = await this.connection.getVoteAccounts();
        const accounts = [
            ...voteAccounts.current.map(acc => ({
                address: acc.votePubkey,
                validator: acc.nodePubkey,
                commission: acc.commission,
                votes: acc.activatedStake,
                rootSlot: acc.rootSlot || 0,
                epoch: acc.epochCredits.length > 0 ? acc.epochCredits[acc.epochCredits.length - 1][0] : 0,
            })),
            ...voteAccounts.delinquent.map(acc => ({
                address: acc.votePubkey,
                validator: acc.nodePubkey,
                commission: acc.commission,
                votes: acc.activatedStake,
                rootSlot: acc.rootSlot || 0,
                epoch: acc.epochCredits.length > 0 ? acc.epochCredits[acc.epochCredits.length - 1][0] : 0,
            }))
        ];
        return accounts;
    }
    // ========== FEE CALCULATION ==========
    async getFeeForMessage(message) {
        const result = await this.connection.getFeeForMessage(message);
        return result.value;
    }
    async getRecentPrioritizationFees() {
        return await this.connection.getRecentPrioritizationFees();
    }
    async getPriorityFeeEstimate(accountKeys, options) {
        const fees = await this.getRecentPrioritizationFees();
        if (fees.length === 0)
            return 1000;
        return Math.ceil(fees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / fees.length);
    }
    // ========== COMPUTE BUDGET ==========
    async setComputeUnitPrice(microLamports) {
        return ComputeBudgetProgram.setComputeUnitPrice({ microLamports });
    }
    async setComputeUnitLimit(units) {
        return ComputeBudgetProgram.setComputeUnitLimit({ units });
    }
    // ========== TOKEN 2022 PROGRAM ==========
    async createToken2022(decimals = 9, options = {}) {
        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(this.connection);
        const transaction = new Transaction();
        transaction.add(SystemProgram.createAccount({
            fromPubkey: this.keypair.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }));
        transaction.add(createInitializeMintInstruction(mintKeypair.publicKey, decimals, options.mintAuthority || this.keypair.publicKey, options.freezeAuthority || this.keypair.publicKey, TOKEN_2022_PROGRAM_ID));
        await sendAndConfirmTransaction(this.connection, transaction, [this.keypair, mintKeypair], {
            commitment: this.commitment,
            skipPreflight: true
        });
        return mintKeypair.publicKey.toString();
    }
    // ========== BATCH OPERATIONS ==========
    async getMultipleBalances(addresses) {
        const balances = await Promise.all(addresses.map(async (address) => ({
            address,
            balance: (await this.getBalance(address)).toString(),
            chain: 'SOLANA',
            symbol: 'SOL'
        })));
        return balances;
    }
    async getMultipleTokenBalances(mint, addresses) {
        const balances = await Promise.all(addresses.map(async (address) => ({
            address,
            balance: (await this.getTokenBalance(mint, address)).toString(),
            token: await this.getTokenInfo(mint)
        })));
        return balances;
    }
    // ========== UTILITY FUNCTIONS ==========
    isValidAddress(address) {
        try {
            new PublicKey(address);
            return true;
        }
        catch {
            return false;
        }
    }
    async getMinimumBalanceForRentExemption(size) {
        return await this.connection.getMinimumBalanceForRentExemption(size);
    }
    async getAccountInfoBatch(addresses) {
        const pubkeys = addresses.map(addr => new PublicKey(addr));
        const accounts = await this.connection.getMultipleAccountsInfo(pubkeys);
        return accounts.map((account, index) => {
            if (!account)
                return null;
            return {
                address: addresses[index],
                lamports: account.lamports,
                owner: account.owner.toString(),
                executable: account.executable,
                data: account.data,
                rentEpoch: account.rentEpoch
            };
        });
    }
    async getTokenAccountBalance(tokenAccount) {
        const pubkey = new PublicKey(tokenAccount);
        const balance = await this.connection.getTokenAccountBalance(pubkey);
        return balance.value.uiAmount || 0;
    }
    async getParsedTokenAccountsByOwner(owner) {
        const ownerPubkey = owner ? new PublicKey(owner) : this.keypair.publicKey;
        const accounts = await this.connection.getParsedTokenAccountsByOwner(ownerPubkey, {
            programId: TOKEN_PROGRAM_ID
        });
        return accounts.value;
    }
    // ========== TRANSACTION HISTORY ==========
    async getTransactionHistory(limit = 10, address) {
        return await this.getRecentTransactions(limit, address);
    }
    async getSignaturesForAddress(address, limit = 10) {
        const pubkey = new PublicKey(address);
        return await this.connection.getSignaturesForAddress(pubkey, { limit });
    }
    // ========== EVENT SUBSCRIPTION ==========
    onAccountChange(address, callback) {
        const pubkey = new PublicKey(address);
        return this.connection.onAccountChange(pubkey, callback, this.commitment);
    }
    onProgramAccountChange(programId, callback) {
        const pubkey = new PublicKey(programId);
        return this.connection.onProgramAccountChange(pubkey, (keyedAccountInfo) => {
            callback(keyedAccountInfo.accountInfo, keyedAccountInfo.accountId);
        }, this.commitment);
    }
    onLogs(callback) {
        const filter = { commitment: this.commitment };
        return this.connection.onLogs(filter, callback);
    }
    onSlotChange(callback) {
        return this.connection.onSlotChange(callback);
    }
    removeEventListener(listenerId) {
        return this.connection.removeAccountChangeListener(listenerId);
    }
    // ========== HEALTH CHECK ==========
    async healthCheck() {
        const startTime = Date.now();
        try {
            const slot = await this.getSlot();
            const latency = Date.now() - startTime;
            return {
                healthy: true,
                latency,
                slot
            };
        }
        catch (error) {
            return {
                healthy: false,
                latency: Date.now() - startTime,
                slot: 0
            };
        }
    }
    // ========== ERROR HANDLING ==========
    static isSolanaError(error) {
        return error && (error.logs || error.signature);
    }
    static getErrorCode(error) {
        if (error.logs) {
            const errorLog = error.logs.find((log) => log.includes('Error:'));
            return errorLog || 'UNKNOWN_SOLANA_ERROR';
        }
        return error.code || 'UNKNOWN_ERROR';
    }
    static getErrorMessage(error) {
        if (typeof error === 'string')
            return error;
        return error.message || 'Unknown Solana error occurred';
    }
}
// Utility functions for Solana
export class SolanaUtils {
    static async getTokenMetadata(mint, connection) {
        try {
            const metaplex = Metaplex.make(connection);
            const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint) });
            const tokenStandard = nft.tokenStandard ? nft.tokenStandard.__kind || nft.tokenStandard.toString() : undefined;
            let useMethod;
            if (nft.uses) {
                const method = nft.uses.useMethod;
                if (method === 'burn' || method === 'multiple' || method === 'single') {
                    useMethod = method;
                }
                else if (typeof method === 'string') {
                    useMethod = method;
                }
            }
            return {
                mint: nft.address.toString(),
                name: nft.name,
                symbol: nft.symbol,
                uri: nft.uri,
                sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
                creators: nft.creators.map(creator => ({
                    address: creator.address.toString(),
                    verified: creator.verified,
                    share: creator.share
                })),
                primarySaleHappened: nft.primarySaleHappened,
                isMutable: nft.isMutable,
                editionNonce: nft.editionNonce || undefined,
                tokenStandard: tokenStandard,
                collection: nft.collection ? {
                    verified: nft.collection.verified,
                    key: nft.collection.address.toString()
                } : undefined,
                uses: nft.uses ? {
                    useMethod: useMethod,
                    remaining: nft.uses.remaining,
                    total: nft.uses.total
                } : undefined
            };
        }
        catch (error) {
            return null;
        }
    }
    static validateAddress(address) {
        try {
            new PublicKey(address);
            return true;
        }
        catch {
            return false;
        }
    }
    static shortAddress(address, chars = 4) {
        return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    }
    static lamportsToSol(lamports) {
        return lamports / LAMPORTS_PER_SOL;
    }
    static solToLamports(sol) {
        return sol * LAMPORTS_PER_SOL;
    }
    static formatAmount(amount, decimals) {
        return (amount / Math.pow(10, decimals)).toFixed(decimals);
    }
    static parseAmount(amount, decimals) {
        return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
    }
}
//# sourceMappingURL=solana.js.map