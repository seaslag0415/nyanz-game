<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="<?php echo esc_url(home_url('/../favicon.ico')); ?>" sizes="any">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main-content">本文へ移動</a>
<header class="site-header">
    <div class="header-inner">
        <a class="site-brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="nyanz-lab Blog ホーム">
            <span class="brand-mark" aria-hidden="true">猫</span><span>nyanz-lab</span>
        </a>
        <nav class="main-nav" aria-label="メインナビゲーション">
            <a href="<?php echo esc_url(home_url('/../')); ?>">Home</a>
            <a href="<?php echo esc_url(home_url('/../games/')); ?>">Games</a>
            <a href="<?php echo esc_url(home_url('/')); ?>" aria-current="page">Blog</a>
            <a href="<?php echo esc_url(home_url('/../about/')); ?>">About</a>
        </nav>
    </div>
</header>
