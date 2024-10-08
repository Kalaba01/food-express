import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronDown, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Loading } from "../index";
import axios from "axios";
import "./SearchBar.css";

function SearchBar() {
  const { t } = useTranslation("global");
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("restaurants");
  const [results, setResults] = useState({ restaurants: [], items: [] });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handles click events outside of the dropdown to close it when clicked elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".search-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handles the search request based on the current search type (restaurants or items)
  const handleSearch = async () => {
    if (query.trim() === "") return;

    setIsLoading(true);

    try {
      if (searchType === "restaurants") {
        const response = await axios.get(
          `http://localhost:8000/api/search/restaurants`,
          {
            params: { query },
          }
        );
        setResults({ restaurants: response.data, items: [] });
      } else {
        const response = await axios.get(
          `http://localhost:8000/api/search/items`,
          {
            params: { query },
          }
        );
        setResults({ restaurants: [], items: response.data });
      }
    } catch (error) {
      console.error(t("SearchBar.errorFetchingResults"), error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles key press events, triggers search when "Enter" is pressed
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Toggles the dropdown menu for selecting search type
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Renders the star rating for restaurants
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="star" />
        ))}
        {halfStar && <FaStarHalfAlt className="star" />}
      </div>
    );
  };

  // Navigates to the selected restaurant's page
  const handleRestaurantClick = (restaurantName) => {
    navigate(`/restaurants/${encodeURIComponent(restaurantName)}`);
  };

  // Navigates to the selected item in a restaurant's menu
  const handleItemClick = (restaurantName) => {
    navigate(`/restaurants/${encodeURIComponent(restaurantName)}`);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <FaSearch className="search-icon" onClick={handleSearch} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t("SearchBar.searchPlaceholder")}
          className="search-input"
        />
        <div className="search-dropdown">
          <button
            className={`search-dropdown-toggle ${dropdownOpen ? "open" : ""}`}
            onClick={toggleDropdown}
          >
            {t(
              searchType === "restaurants"
                ? "SearchBar.restaurants"
                : "SearchBar.items"
            )}
            <FaChevronDown
              className={`search-chevron-icon ${dropdownOpen ? "rotated" : ""}`}
            />
          </button>
          {dropdownOpen && (
            <div className="search-dropdown-menu">
              <div
                onClick={() => {
                  setSearchType("restaurants");
                  setDropdownOpen(false);
                }}
              >
                {t("SearchBar.restaurants")}
              </div>
              <div
                onClick={() => {
                  setSearchType("items");
                  setDropdownOpen(false);
                }}
              >
                {t("SearchBar.items")}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="search-bar-results">
        {isLoading && <Loading />}{" "}
        {/* Prikaz Loading komponente dok se učitavaju podaci */}
        {!isLoading && results.restaurants.length > 0 && (
          <div className="results-section">
            <h2>{t("SearchBar.restaurants")}</h2>
            <div className="results-cards">
              {results.restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="result-card"
                  onClick={() => handleRestaurantClick(restaurant.name)}
                >
                  <h3>{restaurant.name}</h3>
                  {renderStars(restaurant.rating)}
                  <p>
                    {restaurant.address}, {restaurant.city}
                  </p>
                  <p>
                    <strong>{t("SearchBar.category")}:</strong>{" "}
                    {restaurant.category}
                  </p>
                  <p>
                    <strong>{t("SearchBar.contact")}:</strong>{" "}
                    {restaurant.contact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && results.items.length > 0 && (
          <div className="results-section">
            <h2>{t("SearchBar.items")}</h2>
            <div className="results-cards">
              {results.items.map((item) => (
                <div
                  key={item.id}
                  className="result-card"
                  onClick={() => handleItemClick(item.restaurant_name)}
                >
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
