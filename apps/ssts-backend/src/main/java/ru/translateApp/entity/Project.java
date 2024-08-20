package ru.translateApp.entity;

public class Project {
    private String name;
    private String login;
    private String password;
    private String sourceLocale;
    private String targetLocale;
    private String path;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getSourceLocale() {
        return sourceLocale;
    }

    public void setSourceLocale(String sourceLocale) {
        this.sourceLocale = sourceLocale;
    }

    public String getTargetLocale() {
        return targetLocale;
    }

    public void setTargetLocale(String targetLocale) {
        this.targetLocale = targetLocale;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    @Override
    public String toString() {
        return "Project{" +
                "name='" + name + '\'' +
                ", login='" + login + '\'' +
                ", password='" + password + '\'' +
                ", sourceLocale='" + sourceLocale + '\'' +
                ", targetLocale='" + targetLocale + '\'' +
                ", path='" + path + '\'' +
                '}';
    }
}
