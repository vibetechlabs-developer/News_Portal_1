# Database Schema & Relationships

## Entity Relationship Overview

```
User (Custom User Model)
├── Role: SUPER_ADMIN | EDITOR | USER
└── Related to:
    ├── NewsArticle (as author)
    ├── Like (as user)
    ├── Comment (as user)
    └── NewsView (as user)

Category
└── Related to:
    └── NewsArticle (many-to-one)

Section
├── parent_section (self-referential for Gujarat regions)
└── Related to:
    └── NewsArticle (many-to-one)

Tag
└── Related to:
    └── NewsArticle (many-to-many)

NewsArticle
├── author → User (ForeignKey)
├── category → Category (ForeignKey)
├── section → Section (ForeignKey)
├── tags → Tag (ManyToMany)
├── language: EN | HI | GU
├── status: DRAFT | PUBLISHED | ARCHIVED
├── is_breaking_news (Boolean)
├── is_top_news (Boolean)
└── Related to:
    ├── Media (one-to-many)
    ├── Like (one-to-many)
    ├── Comment (one-to-many)
    └── NewsView (one-to-many)

Media
├── news_article → NewsArticle (ForeignKey, nullable)
├── media_type: IMAGE | VIDEO | REEL | YOUTUBE
└── youtube_url (for YouTube videos)

Like
├── user → User (ForeignKey)
└── news_article → NewsArticle (ForeignKey)

Comment (Optional)
├── user → User (ForeignKey)
├── news_article → NewsArticle (ForeignKey)
└── parent_comment → Comment (self-referential for replies)

NewsView
├── news_article → NewsArticle (ForeignKey)
└── user → User (ForeignKey, nullable for anonymous)

Advertisement
├── ad_type: BANNER | SIDEBAR | IN_ARTICLE | POPUP
├── position: TOP | SIDEBAR_LEFT | SIDEBAR_RIGHT | FOOTER
└── No direct relation to other models

AdvertisementRequest
└── No direct relation to other models

ContactMessage
└── No direct relation to other models
```

---

## Detailed Model Specifications

### User Model
```python
Fields:
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- role (CharField: SUPER_ADMIN, EDITOR, USER)
- phone_number (CharField, optional)
- profile_picture (ImageField, optional)
- is_active (Boolean)
- is_staff (Boolean)
- date_joined (DateTime)
- last_login (DateTime)

Relationships:
- One-to-Many: NewsArticle (author)
- One-to-Many: Like
- One-to-Many: Comment
- One-to-Many: NewsView
```

### Category Model
```python
Fields:
- id (Primary Key)
- name_en (CharField)
- name_hi (CharField, optional)
- name_gu (CharField, optional)
- slug (SlugField, unique)
- description (TextField, optional)
- created_at (DateTime)
- updated_at (DateTime)

Relationships:
- One-to-Many: NewsArticle
```

### Section Model
```python
Fields:
- id (Primary Key)
- name_en (CharField)
- name_hi (CharField, optional)
- name_gu (CharField, optional)
- slug (SlugField, unique)
- parent_section (ForeignKey to Section, nullable)
- created_at (DateTime)
- updated_at (DateTime)

Relationships:
- Self-referential: parent_section
- One-to-Many: NewsArticle
```

### NewsArticle Model
```python
Fields:
- id (Primary Key)
- title_en (CharField)
- title_hi (CharField, optional)
- title_gu (CharField, optional)
- slug (SlugField, unique)
- content_en (TextField)
- content_hi (TextField, optional)
- content_gu (TextField, optional)
- summary_en (TextField, optional)
- summary_hi (TextField, optional)
- summary_gu (TextField, optional)
- featured_image (ImageField)
- category (ForeignKey to Category)
- section (ForeignKey to Section)
- author (ForeignKey to User)
- status (CharField: DRAFT, PUBLISHED, ARCHIVED)
- is_breaking_news (Boolean, default=False)
- is_top_news (Boolean, default=False)
- views_count (IntegerField, default=0)
- likes_count (IntegerField, default=0)
- language (CharField: EN, HI, GU)
- published_at (DateTime, nullable)
- created_at (DateTime)
- updated_at (DateTime)

Relationships:
- Many-to-One: User (author)
- Many-to-One: Category
- Many-to-One: Section
- Many-to-Many: Tag
- One-to-Many: Media
- One-to-Many: Like
- One-to-Many: Comment
- One-to-Many: NewsView
```

### Media Model
```python
Fields:
- id (Primary Key)
- news_article (ForeignKey to NewsArticle, nullable)
- media_type (CharField: IMAGE, VIDEO, REEL, YOUTUBE)
- file_url (FileField/URLField)
- youtube_url (URLField, optional)
- thumbnail (ImageField, optional)
- duration (IntegerField, optional, in seconds)
- caption (CharField, optional)
- order (IntegerField, for ordering multiple media)
- created_at (DateTime)

Relationships:
- Many-to-One: NewsArticle (optional, can be standalone)
```

### Tag Model
```python
Fields:
- id (Primary Key)
- name (CharField)
- slug (SlugField, unique)
- created_at (DateTime)

Relationships:
- Many-to-Many: NewsArticle
```

### Like Model
```python
Fields:
- id (Primary Key)
- user (ForeignKey to User)
- news_article (ForeignKey to NewsArticle)
- created_at (DateTime)

Relationships:
- Many-to-One: User
- Many-to-One: NewsArticle

Unique Constraint:
- (user, news_article) - One like per user per article
```

### Comment Model (Optional)
```python
Fields:
- id (Primary Key)
- user (ForeignKey to User)
- news_article (ForeignKey to NewsArticle)
- content (TextField)
- parent_comment (ForeignKey to Comment, nullable)
- is_approved (Boolean, default=False)
- created_at (DateTime)
- updated_at (DateTime)

Relationships:
- Many-to-One: User
- Many-to-One: NewsArticle
- Self-referential: parent_comment (for replies)
```

### NewsView Model
```python
Fields:
- id (Primary Key)
- news_article (ForeignKey to NewsArticle)
- user (ForeignKey to User, nullable)
- ip_address (GenericIPAddressField)
- user_agent (CharField, optional)
- viewed_at (DateTime)

Relationships:
- Many-to-One: NewsArticle
- Many-to-One: User (nullable for anonymous views)
```

### Advertisement Model
```python
Fields:
- id (Primary Key)
- title (CharField)
- advertiser_name (CharField)
- advertiser_email (EmailField)
- advertiser_phone (CharField, optional)
- ad_type (CharField: BANNER, SIDEBAR, IN_ARTICLE, POPUP)
- image_url (URLField, optional)
- video_url (URLField, optional)
- link_url (URLField)
- position (CharField: TOP, SIDEBAR_LEFT, SIDEBAR_RIGHT, FOOTER)
- start_date (DateTime)
- end_date (DateTime)
- is_active (Boolean, default=True)
- click_count (IntegerField, default=0)
- impression_count (IntegerField, default=0)
- created_at (DateTime)
- updated_at (DateTime)

Relationships:
- None (standalone)
```

### AdvertisementRequest Model
```python
Fields:
- id (Primary Key)
- advertiser_name (CharField)
- advertiser_email (EmailField)
- advertiser_phone (CharField)
- company_name (CharField, optional)
- ad_type (CharField)
- budget (DecimalField, optional)
- message (TextField)
- status (CharField: PENDING, APPROVED, REJECTED)
- created_at (DateTime)
- updated_at (DateTime)

Relationships:
- None (standalone)
```

### ContactMessage Model
```python
Fields:
- id (Primary Key)
- name (CharField)
- email (EmailField)
- phone (CharField, optional)
- subject (CharField)
- message (TextField)
- is_read (Boolean, default=False)
- created_at (DateTime)

Relationships:
- None (standalone)
```

---

## Database Indexes (Recommended)

### NewsArticle
- Index on `status` (for filtering published articles)
- Index on `is_breaking_news` (for breaking news queries)
- Index on `is_top_news` (for top news queries)
- Index on `published_at` (for ordering)
- Index on `category_id` (for category filtering)
- Index on `section_id` (for section filtering)
- Index on `author_id` (for author filtering)
- Composite index on `(status, published_at)` (for common queries)

### Like
- Unique index on `(user_id, news_article_id)` (prevent duplicate likes)

### NewsView
- Index on `news_article_id` (for view count queries)
- Index on `viewed_at` (for analytics)

### Section
- Index on `parent_section_id` (for hierarchical queries)

---

## Sample Data Structure

### Sections Hierarchy
```
National
International
Gujarat
  ├── Daxin (Dakshin)
  ├── Utar (Uttar)
  ├── Saurashtra
  ├── Madhya
  └── Gandhinagar
Sports
Education
Politics
Lifestyle
Dharmadarshan
```

### Categories Examples
- Breaking News
- Politics
- Business
- Technology
- Entertainment
- Sports
- Health
- Education
- Lifestyle
- Religion

---

## Migration Strategy

1. **Initial Migration**: Create all models
2. **Data Migration**: Add initial categories and sections
3. **User Migration**: Create super admin user
4. **Translation Migration**: Add translation fields (if using django-modeltranslation)

---

## Database Queries (Common Patterns)

### Get Breaking News
```sql
SELECT * FROM news_article 
WHERE is_breaking_news = TRUE 
AND status = 'PUBLISHED' 
ORDER BY published_at DESC 
LIMIT 10;
```

### Get News by Section
```sql
SELECT * FROM news_article 
WHERE section_id = ? 
AND status = 'PUBLISHED' 
ORDER BY published_at DESC;
```

### Get News with Likes Count
```sql
SELECT na.*, COUNT(l.id) as likes_count 
FROM news_article na 
LEFT JOIN like l ON na.id = l.news_article_id 
WHERE na.status = 'PUBLISHED' 
GROUP BY na.id 
ORDER BY likes_count DESC;
```

### Get News Views Count
```sql
SELECT news_article_id, COUNT(*) as views 
FROM news_view 
WHERE viewed_at >= ? 
GROUP BY news_article_id;
```
