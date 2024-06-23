#ifdef FRAMEBUFFER_PRECISION_HIGH
precision mediump float;
uniform mediump sampler2D map;
#else
precision lowp float;
uniform lowp sampler2D map;
#endif
uniform float steps;
#ifndef TIME_EXISTS
uniform float time;
#endif

#ifndef PI
#define PI 3.1415
#endif

float fixedpow(float a, float x) {
    return pow(abs(a), x) * sign(a);
}

float cbrt(float a) {
    return fixedpow(a, 0.3333333333);
}

vec3 lsrgb2oklab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

    float l_ = cbrt(l);
    float m_ = cbrt(m);
    float s_ = cbrt(s);

    return vec3(0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_, 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_, 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_);
}

vec3 oklab2lsrgb(vec3 c) {
    float l_ = c.r + 0.3963377774 * c.g + 0.2158037573 * c.b;
    float m_ = c.r - 0.1055613458 * c.g - 0.0638541728 * c.b;
    float s_ = c.r - 0.0894841775 * c.g - 1.2914855480 * c.b;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}

//conversion from Oklab colorspace to polar LCh colorspace
vec3 toOklabPolar(vec3 oklab) {
    vec3 polar = vec3(0.0);
    polar.x = oklab.x;
    polar.y = sqrt(oklab.y * oklab.y + oklab.z * oklab.z);
    polar.z = atan(oklab.z, oklab.y);
    return polar;
}

//conversion from Oklab colorspace to polar LCh colorspace
vec3 fromOklabPolar(vec3 polar) {
    vec3 oklab = vec3(0.0);
    oklab.x = polar.x;
    oklab.y = polar.y * cos(polar.z);
    oklab.z = polar.y * sin(polar.z);
    return oklab;
}

float hash(vec2 p, float t) {
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))) + t);
}

float noise(vec2 n, float t) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(hash(b, t), hash(b + d.yx, t), f.x), mix(hash(b + d.xy, t), hash(b + d.yy, t), f.x), f.y);
}

float posterize(vec2 n, float c, float t) {
    return ceil(c * steps - 0.5 * noise(n * 250.0, 0.2 * ceil(t * 5.0)) - 0.25) / steps;
    // return ceil(c * steps - 0.5) / steps;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 texel = texture2D(map, uv);
    vec3 lch = toOklabPolar(lsrgb2oklab(texel.rgb));
    float l = posterize(uv, lch.x, time);
    vec3 posterized = oklab2lsrgb(fromOklabPolar(vec3(l, 0.5 - abs(l - 0.5), posterize(uv, lch.z, time) + (l - 0.5) * 1.0)));
    outputColor = vec4(posterized, texel.a);
}
