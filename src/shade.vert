#version 410
in vec3 vert;

uniform vec2 u_resolution;
void main() {
    gl_Position =  vec4(vert, 1.0);
}