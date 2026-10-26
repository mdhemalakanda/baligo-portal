<?php
/**
 * Plugin Name:       Baligo – B2B Hotel Quotation Portal
 * Plugin URI:        https://baligo.example
 * Description:       Premium B2B hotel quotation management portal for travel agents. Provides an admin dashboard and an agent portal. Current release ships the complete UI layer with mock data; backend integration comes later.
 * Version:           0.1.0
 * Requires at least: 6.4
 * Requires PHP:      8.0
 * Author:            Baligo
 * License:           GPL-2.0-or-later
 * Text Domain:       baligo
 */

defined( 'ABSPATH' ) || exit;

define( 'BALIGO_VERSION', '0.1.0' );
define( 'BALIGO_PLUGIN_FILE', __FILE__ );
define( 'BALIGO_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'BALIGO_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Whether the compiled Baligo app build exists.
 *
 * @return bool
 */
function baligo_has_build() {
	return file_exists( BALIGO_PLUGIN_DIR . 'assets/js/baligo.js' );
}

/**
 * Enqueue the compiled SPA assets on screens that mount the app.
 *
 * @param string $scope   'admin' or 'agent'. Controls the mount point and entry props.
 * @param string $initial Route the SPA should open first (submenu deep-links).
 */
function baligo_enqueue_app( $scope, $initial = '' ) {
	if ( ! baligo_has_build() ) {
		return;
	}

	$js_url  = BALIGO_PLUGIN_URL . 'assets/js/baligo.js';
	$css_url = BALIGO_PLUGIN_URL . 'assets/css/baligo.css';

	wp_enqueue_style( 'baligo-app', $css_url, array(), BALIGO_VERSION );
	wp_enqueue_script( 'baligo-app', $js_url, array(), BALIGO_VERSION, true );

	wp_localize_script(
		'baligo-app',
		'BALIGO_APP',
		array(
			'version'      => BALIGO_VERSION,
			'scope'        => $scope,   // 'admin' | 'agent' – decides which app shell mounts.
			'initialRoute' => $initial, // Route the SPA should open first (submenu deep-links).
			'demo'         => true,     // UI-only build; all data is mock data.
		)
	);
}

/**
 * Admin menu: Baligo dashboard + submenus inside wp-admin.
 * Every submenu opens the same SPA at a different initial route.
 */
function baligo_admin_menu() {
	add_menu_page(
		__( 'Baligo', 'baligo' ),
		__( 'Baligo', 'baligo' ),
		'manage_options',
		'baligo',
		'baligo_render_admin_app',
		'dashicons-superhero',
		58
	);

	$submenus = array(
		''          => __( 'Dashboard', 'baligo' ),
		'hotels'    => __( 'Hotels', 'baligo' ),
		'rooms'     => __( 'Room Types', 'baligo' ),
		'rates'     => __( 'Supplier Rates', 'baligo' ),
		'history'   => __( 'Rate History', 'baligo' ),
		'contracts' => __( 'Contract Import', 'baligo' ),
		'agents'    => __( 'Agents', 'baligo' ),
		'settings'  => __( 'Settings', 'baligo' ),
	);

	foreach ( $submenus as $route => $title ) {
		$slug = '' === $route ? 'baligo' : 'baligo-' . $route;
		add_submenu_page( 'baligo', $title, $title, 'manage_options', $slug, 'baligo_render_admin_app' );
	}
}
add_action( 'admin_menu', 'baligo_admin_menu' );

/**
 * Mark the wp-admin <body> so the app can lift its popper portals above
 * the fixed WP admin menu (Radix renders dropdowns to <body>, not to the
 * bridge div).
 *
 * @param string $classes Space-separated body classes.
 * @return string
 */
function baligo_admin_body_class( $classes ) {
	$classes .= ' baligo-embedded';
	return $classes;
}
add_filter( 'admin_body_class', 'baligo_admin_body_class' );

/**
 * Map a wp-admin page slug to the SPA route it should open.
 *
 * @param string $page Page slug (get_plugin_page_hook / $_GET['page']).
 * @return string Hash route, e.g. '/admin/hotels'.
 */
function baligo_page_route( $page ) {
	$map = array(
		'baligo'          => '/admin',
		'baligo-hotels'    => '/admin/hotels',
		'baligo-rooms'     => '/admin/rooms',
		'baligo-rates'     => '/admin/rates',
		'baligo-history'   => '/admin/history',
		'baligo-contracts' => '/admin/contracts',
		'baligo-agents'    => '/admin/agents',
		'baligo-settings'  => '/admin/settings',
	);
	return isset( $map[ $page ] ) ? $map[ $page ] : '/admin';
}

/**
 * Render the app mount point inside wp-admin.
 */
function baligo_render_admin_app() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'baligo' ) );
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only navigation param.
	$page   = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : 'baligo';
	$initial = baligo_page_route( $page );

	baligo_enqueue_app( 'admin', $initial );
	?>
	<div class="baligo-bridge baligo-embedded">
		<div id="baligo-app-root" data-scope="admin"></div>
	</div>
	<style>
		/* Give the SPA the full wp-admin content area. */
		.baligo-bridge { margin: 0; padding: 0; }
		.baligo-bridge #baligo-app-root { min-height: 100vh; }
		body.wp-admin #wpcontent { padding-left: 0 !important; }
		body.wp-admin #wpbody-content { padding-bottom: 0 !important; }
		body.wp-admin #wpfooter,
		body.wp-admin .notice,
		body.wp-admin .update-nag { display: none !important; }
	</style>
	<?php
}

/**
 * Register virtual frontend pages for the agent portal:
 *   /baligo/          – agent portal app
 *   /baligo/preview/  – printable quotation preview (also hash-routed in-app)
 */
function baligo_register_rewrites() {
	add_rewrite_rule( '^baligo/?$', 'index.php?baligo_app=agent', 'top' );
}
add_action( 'init', 'baligo_register_rewrites' );

/**
 * Whitelist the query var.
 *
 * @param array $vars Query vars.
 * @return array
 */
function baligo_query_vars( $vars ) {
	$vars[] = 'baligo_app';
	return $vars;
}
add_filter( 'query_vars', 'baligo_query_vars' );

/**
 * Flush rewrites once on activation.
 */
function baligo_activate() {
	baligo_register_rewrites();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'baligo_activate' );

/**
 * Render the agent portal full-screen when /baligo/ is visited.
 */
function baligo_template_redirect() {
	if ( ! get_query_var( 'baligo_app' ) ) {
		return;
	}

	baligo_enqueue_app( 'agent' );
	?>
	<!DOCTYPE html>
	<html <?php language_attributes(); ?>>
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title><?php esc_html_e( 'Baligo – Agent Portal', 'baligo' ); ?></title>
		<?php wp_head(); ?>
	</head>
	<body <?php body_class( 'baligo-agent-portal' ); ?>>
		<div id="baligo-app-root" data-scope="agent"></div>
		<?php wp_footer(); ?>
	</body>
	</html>
	<?php
	exit;
}
add_action( 'template_redirect', 'baligo_template_redirect' );
