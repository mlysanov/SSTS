package ru.translateApp.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import ru.translateApp.AppConfig;

import java.io.File;
import java.util.Arrays;
import java.util.List;


@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private AppConfig appConfig;

    @Bean
    public static PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults());
        return http
                .httpBasic(httpBasic -> httpBasic
                        .securityContextRepository(
                                new HttpSessionSecurityContextRepository()))
                .sessionManagement(sessionManagement -> sessionManagement
                        .sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
                .build();

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://37.228.117.62", "https://37.228.117.62", "http://translationservice.site", "https://translationservice.site"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }


    @Bean
    public InMemoryUserDetailsManager inMemoryUserDetailsManager() throws Exception {
        File configFile = new File(appConfig.getConfigJSON());
        ObjectMapper objectMapper = new ObjectMapper();
        List<ru.translateApp.entity.User> usersList;


        usersList = objectMapper.readValue(configFile, new TypeReference<>() {});

        UserDetails[] users = usersList.stream().map(user -> User.builder()
                    .username(user.getLogin())
                    .password(passwordEncoder().encode(user.getPassword()))
                    .roles(user.getRole().toUpperCase())
                    .build())
                .toArray(UserDetails[]::new);

        return new InMemoryUserDetailsManager(users);
    }

    public void addUserToInMemory(String username, String password, String role) throws Exception {
        UserDetails user = User.withUsername(username)
                .password(passwordEncoder().encode(password))
                .roles(role)
                .build();
        inMemoryUserDetailsManager().createUser(user);
    }
}
