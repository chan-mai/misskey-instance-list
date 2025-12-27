<template>
    <div class="min-h-screen bg-back dark:bg-[#0b1220]">
        <!-- Header Section -->
        <header class="min-h-screen flex flex-col justify-center relative py-24 overflow-hidden">
            <!-- 背景テキスト -->
            <div
                class="hidden md:visible absolute right-0 top-1/4 text-[15vw] font-bold text-primary/70 opacity-30 pointer-events-none select-none leading-none whitespace-nowrap">
                ABOUT<br>LIST
            </div>

            <div class="container mx-auto max-w-screen-lg px-6 relative z-10">
                <p class="text-xs md:text-sm uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 font-medium">
                    (非公式)Misskeyサーバーリスト
                </p>

                <h1
                    class="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-12 leading-tight">
                    <span class="text-2xl md:text-5xl font-bold tracking-wider">(Unofficial)</span><br>Misskey <br
                        class="md:hidden">Server List
                </h1>

                <div class="w-16 md:w-24 h-0.5 bg-slate-900 dark:bg-white mb-12"></div>

                <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                    MisskeyHubのサーバーリストがメンテナンス中のまま復旧しないため、<br>
                    非公式のサーバーリストを作成しました。
                </p>
            </div>

            <!-- スクロール指示 -->
            <div class="absolute bottom-8 left-6 md:left-24 flex items-center gap-4 opacity-60 animate-bounce">
                <span class="text-[10px] uppercase tracking-widest dark:text-white">Scroll</span>
                <div class="w-px h-10 bg-slate-900 dark:bg-white"></div>
            </div>
        </header>

        <!-- 背景セクション -->
        <section class="py-32 bg-white dark:bg-slate-900">
            <div class="container mx-auto max-w-screen-lg px-6">
                <div class="flex items-end justify-between mb-24 border-b border-primary/70 pb-6">
                    <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Background
                    </h2>
                    <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">背景</span>
                </div>

                <div class="max-w-2xl mx-auto">
                    <p
                        class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-[2.2] whitespace-pre-line">
                        公式のMisskeyHubに掲載されていたサーバーリストが突如メンテナンス状態となり、長期間にわたって復旧する気配がありませんでした。
                    </p>

                    <p
                        class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-[2.2] whitespace-pre-line">
                        開発者は「混乱を避けるため」と説明していましたが、おそらく<NuxtLink
                            class="text-primary hover:text-primary/70 transition-colors duration-200"
                            to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432"
                            target="_blank">CherryPickの実装変更🔗</NuxtLink>が原因と思われます。
                    </p>

                    <p
                        class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-[2.2] whitespace-pre-line">
                        CherryPickは、Misskeyの派生プロジェクトの一つですが、現行のCherryPickは、<NuxtLink
                            class="text-primary hover:text-primary/70 transition-colors duration-200"
                            to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432#diff-c99e10daaf6c2db57012b73a31a76d7e3bbbf9e2599ed226e2f1651cdff40c20"
                            target="_blank">特定のUAに対し、メタデータで自身をMisskeyのように偽って返す仕組み🔗</NuxtLink>になっています。
                    </p>

                    <p
                        class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-[2.2] whitespace-pre-line">
                        このリストでは、CherryPickのようなスプーフィングを自動的に除外し、純粋なMisskeyサーバーのみを掲載しています。
                    </p>
                </div>
            </div>
        </section>

        <!-- 特徴セクション -->
        <section class="py-32 bg-back dark:bg-[#0b1220]">
            <div class="container mx-auto max-w-screen-lg px-6">
                <div class="flex items-end justify-between mb-24 border-b border-primary/70 pb-6">
                    <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Features
                    </h2>
                    <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">特徴</span>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="space-y-4">
                        <span class="text-4xl font-bold text-primary/70">01</span>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">スプーフィング除外</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            CherryPickなどの偽装サーバーを自動的に検出・除外。純粋なMisskeyサーバーのみを掲載。
                        </p>
                    </div>
                    <div class="space-y-4">
                        <span class="text-4xl font-bold text-primary/70">02</span>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">自動更新</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            定期的にサーバー情報を自動取得・更新。常に最新の状態を維持。
                        </p>
                    </div>
                    <div class="space-y-4">
                        <span class="text-4xl font-bold text-primary/70">03</span>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">検索・ソート</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            サーバー名での検索、ユーザー数・ノート数でのソートなど、便利な機能を提供。
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Action -->
        <section class="relative py-32 bg-white dark:bg-slate-900 overflow-hidden">
            <div
                class="absolute top-1/2 -right-[20%] md:-right-[10%] w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] -translate-y-1/2 rounded-full border border-slate-200 dark:border-slate-800 pointer-events-none">
                <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] rounded-full overflow-hidden"
                    style="background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 24px 24px;">
                </div>

                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="relative w-full h-full">
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div class="w-6 h-6 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse">
                            </div>
                            <div class="absolute inset-0 w-6 h-6 bg-primary rounded-full animate-ping opacity-20">
                            </div>
                        </div>

                        <!-- Most Outer Orbit -->
                        <div class="absolute top-1/2 left-1/2 w-full h-full rounded-full"
                            style="animation: orbit-outer 30s linear infinite;">
                            <div
                                class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded-full">
                            </div>
                        </div>

                        <div class="absolute top-1/2 left-1/2 w-[70%] h-[70%] border border-slate-400 dark:border-slate-600 rounded-full"
                            style="animation: orbit-outer 20s linear infinite;">
                            <div
                                class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-500 dark:bg-slate-400 rounded-full">
                            </div>
                            <div
                                class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-slate-400 dark:bg-slate-500 rounded-full">
                            </div>
                        </div>
                        <div class="absolute top-1/2 left-1/2 w-[45%] h-[45%] border border-slate-300 dark:border-slate-700 rounded-full"
                            style="animation: orbit-inner 15s linear infinite;">
                            <div
                                class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-slate-500 dark:bg-slate-400 rounded-full">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container mx-auto max-w-screen-lg px-6 relative z-10">
                <div class="grid md:grid-cols-2 gap-20">
                    <div class="flex flex-col justify-center h-full">
                        <h2
                            class="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-12 text-slate-900 dark:text-white">
                            Let's find<br>your instance.
                        </h2>
                        <div class="mb-12">
                            <NuxtLink to="/"
                                class="inline-flex items-center gap-2 text-lg text-primary hover:text-primary/70 transition-colors">
                                サーバーを探す
                                <span class="text-xs">→</span>
                            </NuxtLink>
                        </div>
                    </div>
                    <!-- Spacer -->
                    <div class="hidden md:block"></div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: 'About - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト',
    meta: [
        { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索,About' },
        { name: 'description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
        { property: 'og:title', content: 'About - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
        { property: 'og:description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
        { property: 'og:url', content: 'https://servers.misskey.ink/about' },
        { name: 'twitter:title', content: 'About - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
        { name: 'twitter:description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
    ]
});
</script>
<style>
@keyframes orbit-outer {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

@keyframes orbit-inner {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotate(-360deg);
    }
}
</style>