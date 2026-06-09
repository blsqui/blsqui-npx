<!-- ========================================== -->
<!--    LandingPage.svelte    -->
<!-- ========================================== -->

<script lang="ts">
  /**
   * 💡REQUIRED: PASTE YOUR WALLET ADDRESS HERE
   * 
   *   This address acts as your global revenue vault on the blockchain.
   *      All transaction fees and game asset mints will route directly here.
   * 
   *  ここにあなたのBlsqui非中央集権型ウォレットのアドレスを貼り付けてください。
   *   ゲームアセットの売上や取引手数料が、すべてこのアドレスに直接送金されます。
   */
  const WALLET_ADDRESS = "0x1234567890abcdef"; /* <-- Replace this string. Your Wallet Address here. */

  /* ========================================== */

  import * as fcl from "@onflow/fcl";
  import { fade } from 'svelte/transition';
  type FclAuthz = any;
  const signer = fcl.authz as FclAuthz;
  let user = $state<any>(null);
  let esportsBalance = $state<string>('-');
  let isProcessing = $state(false);
  let messageText = $state<string>('Welcome to the Armory. What do you buy?');
  fcl.config({
    "discovery.wallet": "https://lab.blsqui.net/authn",          /* Mainnet: https://wallet.blsqui.net/authn */
    "accessNode.api": "https://rest-testnet.onflow.org",         /* Mainnet: https://rest-mainnet.onflow.org */
    "flow.network": "testnet",                                   /* Mainnet: mainnet */
    "app.detail.title": "SlayTheDragon",                         /* Your eSports IP Title here */
    "app.detail.icon": "https://blsqui.net/assets/pr/heros.png", /* Your eSports IP Icon here */
  });
  $effect(() => {
    fcl.currentUser().subscribe((newVal: any) => {
      user = newVal;
      syncBalance();
    });
  });
  // Get Player's balance
  async function syncBalance() {
    if (!user?.addr) {
      esportsBalance = '-';
      return;
    };
    const account = await fcl.account(user.addr);
    esportsBalance = String(account.balance);
    if (!esportsBalance.includes('.')) {
      const num = parseFloat(esportsBalance) / 100000000;
      esportsBalance = num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      });
    }
  }

  async function handleMainButtonClick() {
    isProcessing = true;
    try {
      const txId = await fcl.mutate({
        template: `https://blsqui.net/flix/registry/307ac4b80fef1149eb769f17ead2420593e86d682d66886f602ad7da466b8443`,
        args: (arg: any, t: any) => [arg(WALLET_ADDRESS, t.Address)],
        proposer: signer,
        payer: signer,
        authorizations: [signer],
        limit: 1000,
      });
      await checkTxSealed(txId);
    } catch (e) {
      isProcessing = false;
    }
  }

  async function checkTxSealed(txId: string) {
      fcl.tx(txId).subscribe((res: any) => {
        if (res.status === 4 && !res.errorMessage) {
          isProcessing = false;
          changeScene();
        } else if (res.errorMessage) {
          isProcessing = false;
          alert(res.errorMessage);
        }
      });
  }

  let scene = $state(1);
  let isCasting = $state<boolean | null>(null);
  function changeScene() {
    scene = 2;
    /// demo game ///
    messageText = "Lyra (Healer): 'O sacred light, purge the ancient shadow... Celestial Judgement!'";
    setTimeout(() => {
      const dragonBar = document.getElementById('dragon-hp-bar');
      if (!dragonBar) return;
      isCasting = true;
      dragonBar.classList.add('animate-pulse', 'brightness-150');
      setTimeout(() => {
          dragonBar.style.width = "50%";
          dragonBar.classList.remove('brightness-150');
          setTimeout(() => { isCasting = false; messageText = "Lyra (Healer): ..." }, 500);
      }, 500);
  }, 3000);
  }
</script>

<div class="min-h-screen bg-[#050505] text-white font-mono flex flex-col p-8 relative overflow-hidden">
  {#if scene === 1 || isCasting === false}
    <div class="flex gap-4">
      {#if !user?.addr}
        <button onclick={fcl.authenticate} class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded font-black uppercase tracking-widest transition-all">
          [ SignIn ]
        </button>
      {:else}
        <button onclick={handleMainButtonClick} disabled={isProcessing} class="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-4 rounded font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          {isProcessing ? "PROCESSING..." : isCasting === false ? "Start Game" : "DEPART TO THE FIELD"}
        </button>
        <button onclick={() => {if(scene === 2){ scene = 1 }else{fcl.unauthenticate()}}} class="px-8 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 py-4 rounded font-black uppercase">
          LEAVE
        </button>
        {#if scene === 2}
          <button onclick={() => { fcl.unauthenticate(); fcl.authenticate();}} class="px-8 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 py-4 rounded font-black uppercase">
            Log Out & Log in again
          </button>
        {/if}
      {/if}
    </div>
  {/if}

  {#if user?.addr}
    <div class="mt-4 text-center">
      <span class="text-[10px] text-slate-600 uppercase tracking-tighter">Connected: {user.addr}</span>
    </div>
  {/if}

  {#if scene == 1}
    <div class="flex-1 max-w-6xl mx-auto w-full mb-1 relative h-[380px] md:h-[450px] overflow-hidden rounded-2xl bg-[#060810]">
      <div class="absolute inset-0 z-0 pointer-events-none">
        <img src="https://blsqui.net/assets/pr/armory.jpg" alt="Shopkeeper / Armory Environment" class="w-full h-full object-cover lg:object-contain lg:object-left drop-shadow-[0_0_20px_rgba(52,211,153,0.15)] opacity-80" />
      </div>
      <div class="absolute inset-0 z-10 flex items-center justify-start p-6 sm:p-12">
        <div class="w-[110px] flex flex-col items-center justify-center bg-[#060810]/60 backdrop-blur-md p-3 rounded-2xl border border-[#2a3b70]/60 shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
          <img src="https://blsqui.net/assets/fire-sword.png" alt="Fire Sword" class="h-[75px] md:h-[90px] object-contain animate-bounce" />
          <div class="mt-4 w-full text-center px-3 py-1.5 bg-orange-500/20 border border-orange-500/60 text-orange-400 text-[11px] font-black tracking-widest rounded uppercase">RARE: FIRE SWORD</div>
        </div>
      </div>
      <div class="absolute bottom-0 right-0 z-10 p-6">
        <img src="https://blsqui.net/assets/pr/heros.png" alt="heros" class="w-[200px] sm:w-[280px] h-auto max-h-[300px] object-contain" />
      </div>
      <div class="absolute bottom-0 right-[120px] sm:right-[300px] w-[240px] sm:w-[280px] h-[250px] sm:h-[300px] z-20 flex flex-col items-center justify-end">
        <img src="https://blsqui.net/assets/pr/healer.png" alt="healer" class="h-[160px] sm:h-[220px] object-contain" />
        <button onclick={() => { messageText = 'Lyra (Healer): Let me join the party to battle and beat the red dragon.'; setTimeout(() => {if (user.addr) { changeScene() } else { fcl.authenticate()}}, 2000)}} class="mt-3 px-3 py-1.5 bg-purple-950/80 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-[10px] font-bold font-mono tracking-wider rounded-lg uppercase transition-all duration-300 transform active:scale-95 shadow-lg">
            💬 Talk & Recruit
        </button>
      </div>
    </div>

  {:else if scene == 2}
    <div id="battle-view" in:fade={{ duration: 800 }} class="w-full max-w-3xl mx-auto">
      <div class="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] bg-cover bg-center" style="background-image: url('https://blsqui.net/assets/pr/battle_field.jpg');">
          <div class="absolute bottom-12 transition-transform duration-500 hover:scale-[1.02]">
              <img src="https://blsqui.net/assets/pr/red_dragon.png" alt="Red Dragon" class="w-[380px] md:w-[440px] h-auto object-contain filter drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]" />
              <div class="w-full h-3 bg-slate-950 rounded-full border border-white/10 p-[2px] overflow-hidden">
                  <div id="dragon-hp-bar" class="w-full h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              </div>
              {#if isCasting}
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen">
                      <div class="absolute rounded-full border-4 border-white bg-cyan-400/20 shadow-[0_0_50px_#fff,0_0_100px_#00f3ff] animate-magic-burst"></div>
                      <div class="absolute w-24 h-24 bg-white rounded-full animate-ping opacity-70 duration-300"></div>
                  </div>
              {/if}
          </div>
          <div class="absolute bottom-6 right-12 flex flex-col items-center gap-6">
              <div class="relative group">
                  <img src="https://blsqui.net/assets/pr/heros.png" alt="Heroes" class="w-32 h-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,243,255,0.2)]" />
                    <div class="w-24 h-1.5 bg-black rounded-full mt-1 border border-white/5 overflow-hidden">
                        <div class="w-full h-full bg-emerald-500 rounded-full"></div>
                    </div>
              </div>
              <div class="relative group flex flex-col items-center">
                  <div class="absolute inset-0 bg-emerald-500/20 rounded-full blur-md animate-ping scale-75 duration-1000"></div>
                  <img src="https://blsqui.net/assets/pr/healer.png" alt="Healer" class="w-28 h-auto object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                  <span class="mt-1 text-[9px] font-mono bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-400 uppercase tracking-wider">Casting</span>
                    <div class="w-24 h-1.5 bg-black rounded-full mt-1 border border-white/5 overflow-hidden">
                        <div class="w-full h-full bg-purple-500 rounded-full"></div>
                    </div>
              </div>
              <span class="text-[10px] font-mono bg-black/75 border border-blue-500/20 px-2 py-0.5 rounded text-blue-300 shadow-md">Party Active</span>
          </div>
      </div>
    </div>
  {/if}

  <div class="max-w-4xl mx-auto w-full z-10">
    <div class="bg-[#0a0f1e] border-4 border-[#2a3b70] p-6 rounded-lg mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] min-h-[100px] flex items-center justify-between">
      <p class="text-lg tracking-tight">
        <span class="text-emerald-500 mr-2">></span><span class={messageText.startsWith('Lyra') ? "text-red-300" : ""}>{messageText}</span>
      </p>
      <div class="flex items-center gap-3 bg-[#060810]/80 border border-emerald-500/30 px-4 py-2.5 rounded-xl self-end md:self-auto shadow-inner">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">Balance:</span>
        <div class="flex items-center gap-1.5 font-mono text-lg font-bold text-white">
          <svg class="w-4 h-4 text-emerald-400 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H9v14" /><path d="M16 10H9" /><path d="M14 14H9" /></svg>
          <span class="text-emerald-400">{esportsBalance}</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
  .animate-bounce {animation: bounce 3s ease-in-out infinite; }
  button { cursor: pointer; }
</style>