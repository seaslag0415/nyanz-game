<?php get_header(); ?>
<main id="main-content" class="blog-main">
    <?php while (have_posts()) : the_post(); ?>
        <article <?php post_class('article'); ?>>
            <header class="article-header"><h1><?php the_title(); ?></h1></header>
            <div class="article-content"><?php the_content(); ?></div>
        </article>
    <?php endwhile; ?>
</main>
<?php get_footer(); ?>
