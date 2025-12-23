<template>
    <div class="min-h-screen bg-back">
        <!-- Header Section -->
        <header class="min-h-screen flex flex-col justify-center relative py-24 overflow-hidden">
            <!-- 背景テキスト -->
            <div
                class="absolute right-0 top-1/4 text-[15vw] font-bold text-primary/70 opacity-30 pointer-events-none select-none leading-none whitespace-nowrap">
                ABOUT<br>LIST
            </div>

            <div class="container mx-auto max-w-screen-lg px-6 relative z-10">
                <p class="text-xs md:text-sm uppercase tracking-[0.4em] text-slate-500 font-medium mb-8">
                    (非公式)Misskeyサーバーリスト
                </p>

                <h1
                    class="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight mb-12 leading-tight">
                    (Unofficial)<br class="md:hidden"> Misskey Server<br class="md:hidden"> List
                </h1>

                <div class="w-16 md:w-24 h-0.5 bg-slate-900 mb-12"></div>

                <p class="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">
                    MisskeyHubのサーバーリストがメンテナンス中のまま復旧しないため、<br>
                    非公式のサーバーリストを作成しました。
                </p>
            </div>

            <!-- スクロール指示 -->
            <div class="absolute bottom-8 left-6 md:left-24 flex items-center gap-4 opacity-60 animate-bounce">
                <span class="text-[10px] uppercase tracking-widest">Scroll</span>
                <div class="w-px h-10 bg-slate-900"></div>
            </div>
        </header>

        <!-- 背景セクション -->
        <section class="py-32 bg-white">
            <div class="container mx-auto max-w-screen-lg px-6">
                <div class="flex items-end justify-between mb-24 border-b border-slate-100 pb-6">
                    <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">Background</h2>
                    <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">01
                        Info</span>
                </div>

                <div class="max-w-2xl mx-auto">
                    <p class="text-sm md:text-base text-slate-600 leading-[2.2] whitespace-pre-line">
                        公式のMisskeyHubに掲載されていたサーバーリストが突如メンテナンス状態となり、長期間にわたって復旧する気配がありませんでした。
                    </p>

                    <p class="text-sm md:text-base text-slate-600 leading-[2.2] whitespace-pre-line">
                        開発者は「混乱を避けるため」と説明していましたが、おそらく<NuxtLink class="text-primary hover:text-primary/70 transition-colors duration-200" to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432">CherryPickの実装変更</NuxtLink>が原因と思われます。
                    </p>

                    <p class="text-sm md:text-base text-slate-600 leading-[2.2] whitespace-pre-line">
                        CherryPickは、Misskeyの派生プロジェクトの一つですが、現行のCherryPickは、<NuxtLink class="text-primary hover:text-primary/70 transition-colors duration-200" to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432#diff-c99e10daaf6c2db57012b73a31a76d7e3bbbf9e2599ed226e2f1651cdff40c20">特定のUAに対し、メタデータで自身をMisskeyのように偽って返す仕組み</NuxtLink>になっています。
                    </p>

                    <p class="text-sm md:text-base text-slate-600 leading-[2.2] whitespace-pre-line">
                        このリストでは、CherryPickのようなスプーフィングを自動的に除外し、純粋なMisskeyサーバーのみを掲載しています。
                    </p>
                </div>
            </div>
        </section>

        <!-- 特徴セクション -->
        <section class="py-32 bg-back">
            <div class="container mx-auto max-w-screen-lg px-6">
                <div class="flex items-end justify-between mb-24 border-b border-primary/70 pb-6">
                    <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">Features</h2>
                    <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">02
                        Info</span>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="space-y-4">
                        <span class="text-4xl font-bold text-primary/70">01</span>
                        <h3 class="text-xl font-bold text-slate-900">スプーフィング除外</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            CherryPickなどの偽装サーバーを自動的に検出・除外。純粋なMisskeyサーバーのみを掲載。
                        </p>
                    </div>
                    <div class="space-y-4">
                        <span class="text-4xl font-bold text-primary/70">02</span>
                        <h3 class="text-xl font-bold text-slate-900">自動更新</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            定期的にサーバー情報を自動取得・更新。常に最新の状態を維持。
                        </p>
                    </div>
                    <div class="space-y-4">
                        <span class="text-4xl font-bold text-primary/70">03</span>
                        <h3 class="text-xl font-bold text-slate-900">検索・ソート</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            サーバー名での検索、ユーザー数・ノート数でのソートなど、便利な機能を提供。
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact / Footer -->
        <section class="py-32 bg-slate-900 text-white">
            <div class="container mx-auto max-w-screen-lg px-6">
                <div class="grid md:grid-cols-2 gap-20">
                    <div>
                        <span class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">03
                            Contact</span>
                        <h2 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-12">
                            Let's find<br>your instance.
                        </h2>
                        <NuxtLink to="/"
                            class="inline-flex items-center gap-2 text-lg font-light text-white hover:text-slate-300 transition-colors">
                            サーバー一覧を見る
                            <span class="text-xs">→</span>
                        </NuxtLink>
                    </div>

                    <div class="flex flex-col justify-end">
                        <ul class="space-y-6">
                            <li class="border-b border-slate-700 pb-4">
                                <NuxtLink to="https://mq1.dev/about" target="_blank" rel="noopener noreferrer"
                                    class="flex items-center justify-between text-lg md:text-xl font-light hover:pl-4 transition-all group">
                                    <span class="group-hover:text-slate-300 transition-colors">Developer</span>
                                    <span class="text-xs opacity-0 group-hover:opacity-100 transition-opacity">OPEN
                                        ↗</span>
                                </NuxtLink>
                            </li>
                            <li class="border-b border-slate-700 pb-4">
                                <NuxtLink to="https://github.com/chan-mai/misskey-instance-list" target="_blank" rel="noopener noreferrer"
                                    class="flex items-center justify-between text-lg md:text-xl font-light hover:pl-4 transition-all group">
                                    <span class="group-hover:text-slate-300 transition-colors">GitHub</span>
                                    <span class="text-xs opacity-0 group-hover:opacity-100 transition-opacity">OPEN
                                        ↗</span>
                                </NuxtLink>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Footer Bottom -->
                <div
                    class="mt-32 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-[10px] text-slate-500 uppercase tracking-widest">
                    <p>© {{ new Date().getFullYear() }} chan-mai</p>
                    <p>(Unofficial) Misskey Server List</p>
                </div>
            </div>
        </section>

        <!-- 免責事項 -->
        <section class="py-8 bg-slate-950 text-white">
            <div class="container mx-auto max-w-screen-lg px-6">
                <p class="text-xs leading-relaxed">
                    このリストは非公式のプロジェクトであり、Misskey開発チームとは関係ありません。
                    掲載されているサーバーの運営状況やセキュリティについて、当プロジェクトは一切の責任を負いません。
                </p>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: 'About - (Unofficial) Misskey Server List',
    meta: [
        { name: 'description', content: '非公式Misskeyサーバーリストについて' },
        { property: 'og:title', content: 'About - (Unofficial) Misskey Server List' },
        { property: 'og:description', content: '非公式Misskeyサーバーリストについて' },
        { property: 'og:url', content: 'https://servers.misskey.ink/about' },
        { name: 'twitter:title', content: 'About - (Unofficial) Misskey Server List' },
        { name: 'twitter:description', content: '非公式Misskeyサーバーリストについて' },
    ]
});
</script>
