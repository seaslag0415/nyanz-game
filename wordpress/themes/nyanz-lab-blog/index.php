<?php get_header(); ?>
<main id="main-content" class="blog-main">
    <header class="page-heading">
        <p class="eyebrow">Journal</p>
        <h1><?php bloginfo('name'); ?></h1>
    </header>
    <?php if (have_posts()) : ?>
        <div class="post-grid">
            <?php while (have_posts()) : the_post(); ?>
                <article <?php post_class('post-card'); ?>>
                    <?php if (has_post_thumbnail()) : ?>
                        <a class="post-thumbnail" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1"><?php the_post_thumbnail('large'); ?></a>
                    <?php endif; ?>
                    <div class="post-card-body">
                        <p class="post-meta"><time datetime="<?php echo esc_attr(get_the_date(DATE_W3C)); ?>"><?php echo esc_html(get_the_date()); ?></time></p>
                        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                        <div class="post-excerpt"><?php the_excerpt(); ?></div>
                    </div>
                </article>
            <?php endwhile; ?>
        </div>
        <nav class="pagination" aria-label="投稿一覧のページ送り"><?php the_posts_pagination(array('mid_size' => 1, 'prev_text' => '前へ', 'next_text' => '次へ')); ?></nav>
    <?php else : ?>
        <section class="empty-state"><h2>記事を準備中です</h2><p>最初の記事が公開されるまで、もう少しお待ちください。</p></section>
    <?php endif; ?>
</main>
<?php get_footer(); ?>
