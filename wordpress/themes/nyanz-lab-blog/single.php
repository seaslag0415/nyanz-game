<?php get_header(); ?>
<main id="main-content" class="blog-main">
    <?php while (have_posts()) : the_post(); ?>
        <article <?php post_class('article'); ?>>
            <header class="article-header">
                <p class="post-meta"><time datetime="<?php echo esc_attr(get_the_date(DATE_W3C)); ?>"><?php echo esc_html(get_the_date()); ?></time></p>
                <h1><?php the_title(); ?></h1>
            </header>
            <div class="article-content"><?php the_content(); ?></div>
        </article>
    <?php endwhile; ?>
</main>
<?php get_footer(); ?>
