<?php get_header(); ?>
<main id="main-content" class="blog-main">
    <section class="empty-state">
        <p class="eyebrow">404</p>
        <h1>ページが見つかりません</h1>
        <p>URLをご確認いただくか、ブログのトップページへお戻りください。</p>
        <p><a href="<?php echo esc_url(home_url('/')); ?>">ブログへ戻る</a></p>
    </section>
</main>
<?php get_footer(); ?>
