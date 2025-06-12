import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import {getFaqCategories} from '../services/api';
import {useTheme, themeColors} from '../context/ThemeContext';
import SvgComponent from 'src/utils/icon/SvgComponent';
import {COLORS} from 'src/utils/constants';

// Utility functions for handling HTML content
const parseHtmlContent = html => {
  if (!html) return '';

  // First, remove any script or style tags and their content
  let parsed = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Replace common HTML entities
  parsed = parsed
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  // Replace <br>, <p>, </p>, <div>, </div> tags with newlines
  parsed = parsed
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<div[^>]*>/gi, '');

  // Remove all other HTML tags but keep their content
  parsed = parsed.replace(/<[^>]*>/g, '');

  // Clean up excessive whitespace and newlines
  parsed = parsed.replace(/\n\s*\n/g, '\n').replace(/^\s+|\s+$/g, '');

  return parsed;
};

// Strip all HTML tags for search functionality
const stripHtmlTags = html => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};

// Back Arrow Icon
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Info Circle Icon
const InfoCircleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#212121" strokeWidth="1.5" />
    <Path
      d="M12 7V12"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="16" r="1" fill="#212121" />
  </Svg>
);

// Search Icon
const SearchIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
      stroke="#9E9E9E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.75 15.75L12.75 12.75"
      stroke="#9E9E9E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chevron Down Icon
const ChevronDownIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M4.5 6.75L9 11.25L13.5 6.75"
      stroke={COLORS.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Headphones Icon for Customer Service
const HeadphonesIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M5.5 19C7.989 19 9 17.989 9 15.5V14C9 11.511 7.989 10.5 5.5 10.5C3.011 10.5 2 11.511 2 14V15.5C2 17.989 3.011 19 5.5 19Z"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 17.002a6.001 6.001 0 01-4.713 5.86l-.638-1.914A4.004 4.004 0 0019.465 19H17a2 2 0 01-2-2v-4a2 2 0 012-2h2.938a8 8 0 00-15.876 0H7a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-5C2 6.477 6.477 2 12 2s10 4.477 10 10v5.002z"
      fill="#ED8721"
    />
  </Svg>
);

// Whatsapp Icon
const WhatsAppIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.403 5.633A8.918 8.918 0 0012.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.98 8.98 0 004.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 00-2.627-6.35zm-6.35 13.812h-.003a7.445 7.445 0 01-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 01-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 015.275 2.188 7.42 7.42 0 012.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462zm4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.15.224-.58.729-.711.879-.131.15-.262.168-.486.056-.224-.112-.947-.349-1.804-1.113-.667-.595-1.117-1.329-1.248-1.554-.131-.225-.014-.346.099-.458.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374.075-.15.038-.281-.019-.393-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.649 9.649 0 00-.429-.008.826.826 0 00-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263z"
      fill="#ED8721"
    />
  </Svg>
);

// Website Icon
const WebsiteIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#ED8721" strokeWidth="1.5" />
    <Path
      d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.62988 8H21.3699"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.62988 16H21.3699"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Facebook Icon
const FacebookIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M12.001 2.002c-5.522 0-10 4.477-10 9.999.001 4.99 3.657 9.126 8.438 9.879v-6.988h-2.54v-2.891h2.54V9.798c0-2.508 1.493-3.891 3.776-3.891 1.094 0 2.24.195 2.24.195V8.56h-1.264c-1.24 0-1.628.772-1.628 1.563v1.875h2.771l-.443 2.891h-2.328v6.988C18.344 21.129 22 16.992 22 12.001c0-5.522-4.477-10-9.999-10z"
      fill="#ED8721"
    />
  </Svg>
);

// Twitter Icon
const TwitterIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 005.001-1.721 4.036 4.036 0 01-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.026 4.026 0 01-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.021 4.021 0 01-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 008.306 4.215c-.062-.3-.1-.611-.1-.923a4.024 4.024 0 014.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 002.556-.973c-.3.93-.93 1.72-1.771 2.22a8.073 8.073 0 002.319-.624 8.646 8.646 0 01-2.019 2.083z"
      fill="#ED8721"
    />
  </Svg>
);

// Instagram Icon
const InstagramIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M20.947 8.305a6.531 6.531 0 00-.419-2.216 4.61 4.61 0 00-2.633-2.633 6.606 6.606 0 00-2.186-.42c-.962-.043-1.267-.055-3.709-.055s-2.755 0-3.71.055a6.606 6.606 0 00-2.185.42 4.607 4.607 0 00-2.633 2.633 6.554 6.554 0 00-.419 2.185c-.043.963-.056 1.268-.056 3.71s0 2.754.056 3.71c.015.748.156 1.486.42 2.187a4.61 4.61 0 002.633 2.632 6.586 6.586 0 002.185.45c.963.043 1.268.056 3.71.056s2.755 0 3.71-.056a6.593 6.593 0 002.186-.419 4.616 4.616 0 002.633-2.633c.263-.7.404-1.438.42-2.187.042-.962.055-1.267.055-3.71-.002-2.442-.002-2.752-.058-3.709zm-8.953 8.297a4.622 4.622 0 01-4.623-4.623 4.622 4.622 0 114.623 4.623zm4.807-8.339a1.077 1.077 0 11-.002-2.154 1.077 1.077 0 01.002 2.154z"
      fill="#ED8721"
    />
    <Path
      d="M11.994 14.982a3.003 3.003 0 100-6.006 3.003 3.003 0 000 6.006z"
      fill="#ED8721"
    />
  </Svg>
);

// LinkedIn Icon
const LinkedInIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 9H2V21H6V9Z"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// YouTube Icon
const YouTubeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50197 4.84824 2.16131 5.19941C1.82066 5.55057 1.57881 5.98541 1.46 6.46C1.14522 8.20556 0.991235 9.97631 1 11.75C0.988768 13.537 1.14276 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17814 18.2945C2.51798 18.6308 2.93882 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8572 8.1787 22.54 6.42Z"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.75 15.02L15.5 11.75L9.75 8.48V15.02Z"
      stroke="#ED8721"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HelpCenterScreen = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const [activeTab, setActiveTab] = useState('FAQ');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);

  // Define static categories
  const staticCategories = [
    {id: 1, name: 'About Legend and New Brand Identity', active: true},
    {id: 2, name: 'About the website', active: false},
    {id: 3, name: 'Car Listings', active: false},
    {id: 4, name: 'Car Pricing', active: false},
    {id: 5, name: 'Inquiry Process', active: false},
    {id: 6, name: 'Offline Sales', active: false},
    {id: 7, name: 'Images & Specifications', active: false},
    {id: 8, name: 'Account & Notifications', active: false},
    {id: 9, name: 'Miscellaneous FAQs', active: false},
  ];

  // Static FAQ data
  const staticFaqData = [
    // About Legend and New Brand Identity
    {
      id: '1-1',
      categoryId: 1,
      question: 'Who are we?',
      answer:
        'We are Legend Motors and have been providing Affordable & sustainable Mobility solutions since 2008 touching millions of lives around the World. Renowned for being a step ahead and making Today the future with our one of kind product assortment for over a decade now.',
      plainTextAnswer:
        'We are Legend Motors and have been providing Affordable & sustainable Mobility solutions since 2008 touching millions of lives around the World. Renowned for being a step ahead and making Today the future with our one of kind product assortment for over a decade now.',
    },
    {
      id: '1-2',
      categoryId: 1,
      question: 'What changes have been made in legend?',
      answer:
        'We have undergone a complete transformation and have embraced a new identity. We changed our previous logo and branding to a new one encapsulating Purple, a color of strength, intelligence, and strategic vision and Orange, a symbol of energy, ambition, and progress. The Legend logo is a bold representation of transformation, unity and boundless growth, brought to life through a carefully chosen color palette. We are the Old legend bringing new freshness to our customers without compromising our quality.',
      plainTextAnswer:
        'We have undergone a complete transformation and have embraced a new identity. We changed our previous logo and branding to a new one encapsulating Purple, a color of strength, intelligence, and strategic vision and Orange, a symbol of energy, ambition, and progress. The Legend logo is a bold representation of transformation, unity and boundless growth, brought to life through a carefully chosen color palette. We are the Old legend bringing new freshness to our customers without compromising our quality.',
    },
    {
      id: '1-3',
      categoryId: 1,
      question: "Who is Legend's official Ambassador?",
      answer:
        "Meet Lumo — The Guardian and Guide of Legend. Lumo is more than just an ambassador or a mascot — it's the guardian spirit and intelligent guide of Legend. Born from a vision to unite innovation, sustainability, and human connection, Lumo embodies the values that drive Legend forward in the world of mobility, energy, and technology.",
      plainTextAnswer:
        "Meet Lumo — The Guardian and Guide of Legend. Lumo is more than just an ambassador or a mascot — it's the guardian spirit and intelligent guide of Legend. Born from a vision to unite innovation, sustainability, and human connection, Lumo embodies the values that drive Legend forward in the world of mobility, energy, and technology.",
    },

    // About the website
    {
      id: '2-1',
      categoryId: 2,
      question: 'What is Legend website about?',
      answer:
        "Legend's website allows you to browse a wide range of cars available for sale. You can send inquiries to our sales team, who will assist you offline. You can select the cars of your choice from a wide range of vehicles. We have cars from top brands of the world and helps you buy the car seamlessly.",
      plainTextAnswer:
        "Legend's website allows you to browse a wide range of cars available for sale. You can send inquiries to our sales team, who will assist you offline. You can select the cars of your choice from a wide range of vehicles. We have cars from top brands of the world and helps you buy the car seamlessly.",
    },
    {
      id: '2-2',
      categoryId: 2,
      question: 'Do I need an account to browse cars?',
      answer:
        'No, you can browse cars without an account. However, creating an account allows you to view the best prices, save your favorite cars and track your inquiries.',
      plainTextAnswer:
        'No, you can browse cars without an account. However, creating an account allows you to view the best prices, save your favorite cars and track your inquiries.',
    },
    {
      id: '2-3',
      categoryId: 2,
      question: 'How do I send an inquiry about a car?',
      answer:
        'Simply click the "Inquire Now" button on the car\'s detail page, that will send the inquiry details and our sales team will contact you shortly. If you are a non-registered user, You might need to fill in the forms for us to connect with you.',
      plainTextAnswer:
        'Simply click the "Inquire Now" button on the car\'s detail page, that will send the inquiry details and our sales team will contact you shortly. If you are a non-registered user, You might need to fill in the forms for us to connect with you.',
    },
    {
      id: '2-4',
      categoryId: 2,
      question: 'Can I test drive a car listed on your website?',
      answer:
        'Once you send an inquiry, our sales team will arrange a test drive for you based on availability.',
      plainTextAnswer:
        'Once you send an inquiry, our sales team will arrange a test drive for you based on availability.',
    },

    // Car Listings
    {
      id: '3-1',
      categoryId: 3,
      question: 'Are the car listings updated regularly?',
      answer:
        'Yes, Absolutely, we update our inventory frequently to ensure you see the latest cars available for sale with the best prices available in the market.',
      plainTextAnswer:
        'Yes, Absolutely, we update our inventory frequently to ensure you see the latest cars available for sale with the best prices available in the market.',
    },
    {
      id: '3-2',
      categoryId: 3,
      question: 'Can I filter cars by brand, model, or price range?',
      answer:
        'Totally! Use our advanced filters to narrow down your search based on brand, model, price range, and other features.',
      plainTextAnswer:
        'Totally! Use our advanced filters to narrow down your search based on brand, model, price range, and other features.',
    },
    {
      id: '3-3',
      categoryId: 3,
      question: 'Are all cars listed new, or do you also sell used cars?',
      answer:
        'Legend Global website helps you to buy brand new cars hitting the market.',
      plainTextAnswer:
        'Legend Global website helps you to buy brand new cars hitting the market.',
    },

    // Car pricing
    {
      id: '4-1',
      categoryId: 4,
      question: 'Are the prices listed negotiable?',
      answer:
        'Prices are indicative and may be negotiable depending on the car and the offers we provide. The offers are subject to changes according to the business requirements and market status. Our sales team can provide more details when they contact you.',
      plainTextAnswer:
        'Prices are indicative and may be negotiable depending on the car and the offers we provide. The offers are subject to changes according to the business requirements and market status. Our sales team can provide more details when they contact you.',
    },
    {
      id: '4-2',
      categoryId: 4,
      question: 'Are taxes or registration fees included in the listed price?',
      answer:
        'No, the listed price is exclusive of taxes and registration fees. Our sales team will help you understand the total cost during discussions. Note: All Prices Mentioned in the App are Ex Works jebel Ali (Export Prices). Selected Models are available to be Registered in the UAE. (Import Duty/Customs/other Charges will be additional) Products are subject to availability. Getting offer for the car does not promise car availability until a Deposit is received.',
      plainTextAnswer:
        'No, the listed price is exclusive of taxes and registration fees. Our sales team will help you understand the total cost during discussions. Note: All Prices Mentioned in the App are Ex Works jebel Ali (Export Prices). Selected Models are available to be Registered in the UAE. (Import Duty/Customs/other Charges will be additional) Products are subject to availability. Getting offer for the car does not promise car availability until a Deposit is received.',
    },
    {
      id: '4-3',
      categoryId: 4,
      question: 'How does Legend Motors price the car listed on the platform?',
      answer:
        'The Prices are listed based on the Supply & Demand of the particular make and model. We try to keep ourselves updated to ensure we offer the most competitive rates possible.',
      plainTextAnswer:
        'The Prices are listed based on the Supply & Demand of the particular make and model. We try to keep ourselves updated to ensure we offer the most competitive rates possible.',
    },

    // Inquiry Process
    {
      id: '5-1',
      categoryId: 5,
      question:
        'How long does it take for the sales team to respond to my inquiry?',
      answer:
        'Our sales team typically responds within 24 hours of receiving your inquiry.',
      plainTextAnswer:
        'Our sales team typically responds within 24 hours of receiving your inquiry.',
    },
    {
      id: '5-2',
      categoryId: 5,
      question: 'Can I inquire about multiple cars at once?',
      answer:
        'Yes, you can send inquiries for multiple cars by visiting their respective pages. We are at your service to help you find your dream car.',
      plainTextAnswer:
        'Yes, you can send inquiries for multiple cars by visiting their respective pages. We are at your service to help you find your dream car.',
    },

    // Offline Sales Process
    {
      id: '6-1',
      categoryId: 6,
      question: 'What happens after I send an inquiry?',
      answer:
        'After receiving your inquiry, our sales team will contact you via phone or email to discuss further details about the car, pricing, and the next steps.',
      plainTextAnswer:
        'After receiving your inquiry, our sales team will contact you via phone or email to discuss further details about the car, pricing, and the next steps.',
    },
    {
      id: '6-2',
      categoryId: 6,
      question: 'Can I visit your showroom to see the car in person?',
      answer:
        'Yes! Once our sales team contacts you, they can arrange a visit to our showroom or to be nearest to you. It is highly advised to contact our team before you arrive if you have any specific inquiry.',
      plainTextAnswer:
        'Yes! Once our sales team contacts you, they can arrange a visit to our showroom or to be nearest to you. It is highly advised to contact our team before you arrive if you have any specific inquiry.',
    },
    {
      id: '6-3',
      categoryId: 6,
      question: 'Where are your cars located?',
      answer:
        'Most of the cars in our catalog are located in Jebel Ali, Dubai and few cars in branches. Once you purchase any car online, You can arrange to pickup from our Location in Dubai. For B2B customers, some of our vehicles are also available in other countries, where we conduct our rigorous vehicle inspection process. We also Offer to ship it to the port closest to you or deliver it right to your doorstep.',
      plainTextAnswer:
        'Most of the cars in our catalog are located in Jebel Ali, Dubai and few cars in branches. Once you purchase any car online, You can arrange to pickup from our Location in Dubai. For B2B customers, some of our vehicles are also available in other countries, where we conduct our rigorous vehicle inspection process. We also Offer to ship it to the port closest to you or deliver it right to your doorstep.',
    },

    // Images & Specifications
    {
      id: '7-1',
      categoryId: 7,
      question: 'Are there detailed images of each car?',
      answer:
        'Yes, every car listing includes high-quality images showcasing both interior and exterior views. Also, we provide you the option to view specific highlights and features of the car as well.',
      plainTextAnswer:
        'Yes, every car listing includes high-quality images showcasing both interior and exterior views. Also, we provide you the option to view specific highlights and features of the car as well.',
    },
    {
      id: '7-2',
      categoryId: 7,
      question: 'Where can I find technical specifications for each car?',
      answer:
        'Each car listing includes detailed technical specifications like engine type, mileage, features, and more.',
      plainTextAnswer:
        'Each car listing includes detailed technical specifications like engine type, mileage, features, and more.',
    },

    // Account & Notifications
    {
      id: '8-1',
      categoryId: 8,
      question:
        'Will I receive updates on new listings if I register an account?',
      answer:
        'Yes! Registered users can opt-in for email or push notifications about new car listings and offers. We provide you with a lot of information in addition to helping you stay informed about the latest offers and prices.',
      plainTextAnswer:
        'Yes! Registered users can opt-in for email or push notifications about new car listings and offers. We provide you with a lot of information in addition to helping you stay informed about the latest offers and prices.',
    },
    {
      id: '8-2',
      categoryId: 8,
      question: 'Can I save my favorite cars for later?',
      answer:
        'Yes! Create an account to save your favorite cars and access them anytime.',
      plainTextAnswer:
        'Yes! Create an account to save your favorite cars and access them anytime.',
    },

    // Miscellaneous FAQs
    {
      id: '9-1',
      categoryId: 9,
      question: 'Do you offer financing options for purchasing cars?',
      answer:
        'Financing options are not available directly through our website but may be discussed with our sales team offline.',
      plainTextAnswer:
        'Financing options are not available directly through our website but may be discussed with our sales team offline.',
    },
  ];

  const [faqCategories, setFaqCategories] = useState(staticCategories);
  const [activeCategoryId, setActiveCategoryId] = useState(1);
  const [faqs, setFaqs] = useState(staticFaqData);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter FAQs when search query or active category changes
  useEffect(() => {
    filterFaqs();
  }, [searchQuery, activeCategoryId]);

  // Initialize with filtered faqs based on first category
  useEffect(() => {
    filterFaqs();
  }, []);

  const filterFaqs = () => {
    let filtered = [...faqs];

    // Filter by active category
    if (activeCategoryId) {
      filtered = filtered.filter(faq => faq.categoryId === activeCategoryId);
    }

    // Filter by search query using plain text versions
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          (faq.plainTextAnswer &&
            faq.plainTextAnswer.toLowerCase().includes(query)),
      );
    }

    setFilteredFaqs(filtered);
  };

  const handleCategoryPress = categoryId => {
    setActiveCategoryId(categoryId);

    // Update active status in faqCategories
    const updatedCategories = faqCategories.map(category => ({
      ...category,
      active: category.id === categoryId,
    }));

    setFaqCategories(updatedCategories);
  };

  const toggleExpandItem = id => {
    if (expandedItem === id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(id);
    }
  };

  const handleSearch = text => {
    setSearchQuery(text);
  };

  // Handle opening external links
  const handleOpenLink = async url => {
    if (!url) {
      Alert.alert('Error', 'Invalid link');
      return;
    }

    try {
      // Normalize URLs
      const normalizedUrl =
        url.startsWith('tel:') || url.startsWith('https://')
          ? url
          : `https://${url}`;

      // Special handling for phone calls on Android
      if (url.startsWith('tel:') && Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            {
              title: 'Phone Call Permission',
              message: 'Legend Motors needs permission to make phone calls',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Permission Denied',
              'Cannot make phone call without permission',
            );
            return;
          }
        } catch (err) {
          console.warn(err);
          return;
        }
      }

      // Check if the link can be opened
      const canOpen = await Linking.canOpenURL(normalizedUrl);

      if (canOpen) {
        await Linking.openURL(normalizedUrl);
      } else {
        console.warn(`Cannot open URL: ${normalizedUrl}`);

        // Specific handling for different URL types
        if (url.startsWith('tel:')) {
          Alert.alert('Phone Call', 'Would you like to call this number?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Call', onPress: () => Linking.openURL(url)},
          ]);
        } else if (url.includes('whatsapp')) {
          Alert.alert('WhatsApp', 'Open WhatsApp to send a message?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open', onPress: () => Linking.openURL(url)},
          ]);
        } else {
          Alert.alert(
            'Open Link',
            'Would you like to open this link in your browser?',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open', onPress: () => Linking.openURL(normalizedUrl)},
            ],
          );
        }
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        'Error',
        'Could not open the link. Please try again later or check your internet connection.',
        [{text: 'OK'}],
      );
    }
  };

  // Define contact items for Contact Us tab with their respective URLs
  const contactItems = [
    {
      id: '1',
      name: 'Customer Service',
      icon: <HeadphonesIcon />,
      url: 'tel:+971 50 966 0888',
    },
    {
      id: '2',
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      url: 'https://api.whatsapp.com/send/?phone=971509660888&text&type=phone_number&app_absent=0',
    },
    {
      id: '3',
      name: 'Website',
      icon: <WebsiteIcon />,
      url: 'https://legendmotorsglobal.com',
    },
    {
      id: '4',
      name: 'Facebook',
      icon: <FacebookIcon />,
      url: 'https://www.facebook.com/legendmotorsglobal',
    },
    {
      id: '5',
      name: 'Twitter',
      icon: <TwitterIcon />,
      url: 'https://twitter.com/legendmotorsdxb',
    },
    {
      id: '6',
      name: 'Instagram',
      icon: <InstagramIcon />,
      url: 'https://www.instagram.com/legendmotorsglobal/',
    },
    // {
    //   id: '7',
    //   name: 'LinkedIn',
    //   icon: <LinkedInIcon />,
    //   url: 'https://www.linkedin.com/company/legendmotors/'
    // },
    // {
    //   id: '8',
    //   name: 'YouTube',
    //   icon: <YouTubeIcon />,
    //   url: 'https://www.youtube.com/@legendmotorsgroup7502'
    // }
  ];

  const renderFAQTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={[styles.loadingText, {color: themeColors[theme].text}]}>
            Loading FAQs...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, {color: themeColors[theme].text}]}>
            {error}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* FAQ Categories - Vertical Layout */}
        <View style={styles.categoriesVerticalContainer}>
          {faqCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButtonVertical,
                category.active && styles.activeCategoryButtonVertical,
                {
                  backgroundColor: category.active
                    ? isDark
                      ? '#FF8C00'
                      : '#F47B20'
                    : isDark
                    ? '#333333'
                    : '#F5F5F5',
                },
              ]}
              onPress={() => handleCategoryPress(category.id)}>
              <Text
                style={[
                  styles.categoryTextVertical,
                  {
                    color: category.active
                      ? '#FFFFFF'
                      : isDark
                      ? '#FFFFFF'
                      : '#333333',
                  },
                ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              borderColor: themeColors[theme].border,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            },
          ]}>
          <View style={styles.searchIcon}>
            <SearchIcon />
          </View>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: isDark ? '#FFFFFF' : themeColors[theme].text,
              },
            ]}
            placeholder="Search for help"
            placeholderTextColor={isDark ? '#888888' : '#666666'}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* FAQ Items */}
        {filteredFaqs.length > 0 ? (
          <View style={styles.faqItemsContainer}>
            {filteredFaqs.map(item => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleExpandItem(item.id)}>
                  <Text
                    style={[
                      styles.questionText,
                      {color: isDark ? '#FFFFFF' : '#212121'},
                    ]}>
                    {item.question}
                  </Text>
                  <View
                    style={
                      expandedItem === item.id
                        ? styles.chevronUp
                        : styles.chevronDown
                    }>
                    <ChevronDownIcon />
                  </View>
                </TouchableOpacity>
                {expandedItem === item.id && item.answer && (
                  <View style={styles.answerContainer}>
                    <Text
                      style={[
                        styles.answerText,
                        {color: isDark ? '#FFFFFF' : '#757575'},
                      ]}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              {searchQuery.trim()
                ? 'No FAQs found matching your search. Try different keywords.'
                : 'No FAQs available for this category.'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderContactTab = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.contactHeaderText}>
          Connect with Legend Motors through any of these channels:
        </Text>
        <View style={styles.contactItemsContainer}>
          {contactItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.contactItem,
                {
                  borderBottomColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#333333' : '#F5F5F5',
                },
              ]}
              onPress={() => handleOpenLink(item.url)}>
              <View style={styles.contactIcon}>{item.icon}</View>
              <Text
                style={[
                  styles.contactName,
                  {color: isDark ? '#FFFFFF' : '#212121'},
                ]}>
                {item.name}
              </Text>
              <View style={styles.contactArrow}>
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M6 12L10 8L6 4"
                    stroke={isDark ? '#FFFFFF' : '#212121'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, {color: isDark ? '#FFFFFF' : '#2D2D2D'}]}
          onPress={() => navigation.goBack()}>
          <SvgComponent />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
          Help Center
        </Text>
      </View>

      <View
        style={[
          styles.tabsContainer,
          {borderBottomColor: themeColors[theme].border},
        ]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'FAQ' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('FAQ')}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'FAQ'
                    ? themeColors[theme].primary
                    : themeColors[theme].text,
              },
            ]}>
            FAQ
          </Text>
          {activeTab === 'FAQ' && (
            <View
              style={[
                styles.activeTabIndicator,
                {backgroundColor: themeColors[theme].primary},
              ]}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Contact' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('Contact')}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'Contact'
                    ? themeColors[theme].primary
                    : themeColors[theme].text,
              },
            ]}>
            Contact us
          </Text>
          {activeTab === 'Contact' && (
            <View
              style={[
                styles.activeTabIndicator,
                {backgroundColor: themeColors[theme].primary},
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'FAQ' ? renderFAQTab() : renderContactTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 2,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  categoriesVerticalContainer: {
    marginBottom: 16,
    width: '100%',
  },
  categoryButtonVertical: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F47B20',
  },
  activeCategoryButtonVertical: {
    backgroundColor: '#F47B20',
  },
  categoryTextVertical: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  faqItemsContainer: {
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    flex: 1,
    paddingRight: 8,
  },
  chevronUp: {
    transform: [{rotate: '180deg'}],
  },
  chevronDown: {
    // Default orientation, no transformation needed
  },
  answerContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  htmlParagraph: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  htmlStrong: {
    fontWeight: 'bold',
    color: '#424242',
  },
  htmlSpan: {
    fontSize: 14,
    lineHeight: 20,
  },
  htmlListItem: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    lineHeight: 20,
  },
  htmlList: {
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactItemsContainer: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 16,
  },
  contactName: {
    fontSize: 16,
    flex: 1,
  },
  contactArrow: {
    marginLeft: 8,
  },
  contactHeaderText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#212121',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  noResultsText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default HelpCenterScreen;
