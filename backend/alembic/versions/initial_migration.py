"""Initial migration for URADI-360 MVP tables

Revision ID: 1e1d2a4e3f5a
Revises: 
Create Date: 2026-03-15 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


# revision identifiers, used by Alembic.
revision = '1e1d2a4e3f5a'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tenants table
    op.create_table('tenants',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('display_name', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=False),
        sa.Column('tier', sa.String(), nullable=False),
        sa.Column('candidate_name', sa.String()),
        sa.Column('candidate_party', sa.String()),
        sa.Column('lga_count', sa.Integer()),
        sa.Column('config', JSONB(), default={}),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Users table
    op.create_table('users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('phone', sa.String()),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('assigned_lga', sa.String()),
        sa.Column('active', sa.Boolean(), default=True),
        sa.Column('last_login', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # LGAs table
    op.create_table('lgas',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('code', sa.String()),
        sa.Column('population', sa.Integer()),
        sa.Column('geo_json', JSONB()),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Wards table
    op.create_table('wards',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('lga_id', UUID(as_uuid=True), sa.ForeignKey('lgas.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('polling_units', sa.Integer()),
        sa.Column('registered_voters', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Voters table
    op.create_table('voters',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('phone', sa.String()),
        sa.Column('lga_id', UUID(as_uuid=True), sa.ForeignKey('lgas.id')),
        sa.Column('ward_id', UUID(as_uuid=True), sa.ForeignKey('wards.id')),
        sa.Column('gender', sa.String()),
        sa.Column('age_range', sa.String()),
        sa.Column('occupation', sa.String()),
        sa.Column('language_pref', sa.String(), default='ha'),
        sa.Column('party_leaning', sa.String()),
        sa.Column('sentiment_score', sa.Integer(), default=0),
        sa.Column('persuadability', sa.Integer(), default=50),
        sa.Column('contact_count', sa.Integer(), default=0),
        sa.Column('last_contacted', sa.DateTime(timezone=True)),
        sa.Column('source', sa.String()),
        sa.Column('tags', JSONB(), default=[]),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Anchor Citizens table
    op.create_table('anchor_citizens',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('voter_id', UUID(as_uuid=True), sa.ForeignKey('voters.id')),
        sa.Column('lga_id', UUID(as_uuid=True), sa.ForeignKey('lgas.id')),
        sa.Column('ward_id', UUID(as_uuid=True), sa.ForeignKey('wards.id')),
        sa.Column('influence_level', sa.Integer()),
        sa.Column('community_role', sa.String()),
        sa.Column('reports_submitted', sa.Integer(), default=0),
        sa.Column('stipend_status', sa.String(), default='pending'),
        sa.Column('active', sa.Boolean(), default=True),
        sa.Column('recruited_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Political Actors table
    op.create_table('political_actors',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('title', sa.String()),
        sa.Column('party', sa.String()),
        sa.Column('faction', sa.String()),
        sa.Column('lga_id', UUID(as_uuid=True), sa.ForeignKey('lgas.id')),
        sa.Column('influence_level', sa.Integer()),
        sa.Column('loyalty_status', sa.String()),
        sa.Column('relationship_to_candidate', sa.String()),
        sa.Column('vulnerability_notes', sa.Text()),
        sa.Column('last_intel_update', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Sentiment Entries table
    op.create_table('sentiment_entries',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('lga_id', UUID(as_uuid=True), sa.ForeignKey('lgas.id')),
        sa.Column('ward_id', UUID(as_uuid=True), sa.ForeignKey('wards.id')),
        sa.Column('raw_text', sa.Text()),
        sa.Column('sentiment', sa.String()),
        sa.Column('score', sa.Float()),
        sa.Column('topics', JSONB(), default=[]),
        sa.Column('language', sa.String()),
        sa.Column('respondent_phone', sa.String()),
        sa.Column('processed', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Content Items table
    op.create_table('content_items',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('body', sa.Text()),
        sa.Column('content_type', sa.String()),
        sa.Column('language', sa.String(), default='ha'),
        sa.Column('platform', sa.String()),
        sa.Column('status', sa.String(), default='draft'),
        sa.Column('scheduled_at', sa.DateTime(timezone=True)),
        sa.Column('published_at', sa.DateTime(timezone=True)),
        sa.Column('engagement', JSONB(), default={}),
        sa.Column('created_by', UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Polling Units table
    op.create_table('polling_units',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('lga_id', UUID(as_uuid=True), sa.ForeignKey('lgas.id')),
        sa.Column('ward_id', UUID(as_uuid=True), sa.ForeignKey('wards.id')),
        sa.Column('pu_code', sa.String(), nullable=False),
        sa.Column('pu_name', sa.String()),
        sa.Column('registered_voters', sa.Integer(), default=0),
        sa.Column('accredited_voters', sa.Integer(), default=0),
        sa.Column('votes_cast', sa.Integer(), default=0),
        sa.Column('latitude', sa.Float()),
        sa.Column('longitude', sa.Float()),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Monitor Assignments table
    op.create_table('monitor_assignments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('polling_unit_id', UUID(as_uuid=True), sa.ForeignKey('polling_units.id')),
        sa.Column('assignment_date', sa.DateTime(timezone=True), default=sa.func.now()),
        sa.Column('check_in_at', sa.DateTime(timezone=True)),
        sa.Column('check_in_lat', sa.Float()),
        sa.Column('check_in_lng', sa.Float()),
        sa.Column('check_in_verified', sa.Boolean(), default=False),
        sa.Column('check_out_at', sa.DateTime(timezone=True)),
        sa.Column('status', sa.String(), default='assigned'),
        sa.Column('notes', sa.Text())
    )
    
    # Accreditation Records table
    op.create_table('accreditation_records',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('polling_unit_id', UUID(as_uuid=True), sa.ForeignKey('polling_units.id')),
        sa.Column('monitor_id', UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('time_slot', sa.String()),
        sa.Column('accredited_count', sa.Integer(), default=0),
        sa.Column('bvas_functional', sa.Boolean(), default=True),
        sa.Column('queue_length', sa.String()),
        sa.Column('issues_reported', JSONB(), default=[]),
        sa.Column('photo_url', sa.String()),
        sa.Column('recorded_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Vote Tally table
    op.create_table('vote_tallies',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('polling_unit_id', UUID(as_uuid=True), sa.ForeignKey('polling_units.id')),
        sa.Column('monitor_id', UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('candidate_name', sa.String(), nullable=False),
        sa.Column('party', sa.String(), nullable=False),
        sa.Column('votes_received', sa.Integer(), default=0),
        sa.Column('is_incumbent', sa.Boolean(), default=False),
        sa.Column('photo_url', sa.String()),
        sa.Column('recorded_at', sa.DateTime(timezone=True), default=sa.func.now()),
        sa.Column('verified', sa.Boolean(), default=False)
    )
    
    # Election Day Incidents table
    op.create_table('election_day_incidents',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('polling_unit_id', UUID(as_uuid=True), sa.ForeignKey('polling_units.id')),
        sa.Column('monitor_id', UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('incident_type', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), default='medium'),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('latitude', sa.Float()),
        sa.Column('longitude', sa.Float()),
        sa.Column('photos', JSONB(), default=[]),
        sa.Column('status', sa.String(), default='reported'),
        sa.Column('reported_at', sa.DateTime(timezone=True), default=sa.func.now()),
        sa.Column('resolved_at', sa.DateTime(timezone=True)),
        sa.Column('resolution_notes', sa.Text())
    )


def downgrade() -> None:
    # Drop tables in reverse order of creation
    op.drop_table('election_day_incidents')
    op.drop_table('vote_tallies')
    op.drop_table('accreditation_records')
    op.drop_table('monitor_assignments')
    op.drop_table('polling_units')
    op.drop_table('intelligence_reports')
    op.drop_table('messages_log')
    op.drop_table('scorecard_entries')
    op.drop_table('content_items')
    op.drop_table('sentiment_entries')
    op.drop_table('political_actors')
    op.drop_table('anchor_citizens')
    op.drop_table('voters')
    op.drop_table('wards')
    op.drop_table('lgas')
    op.drop_table('users')
    op.drop_table('tenants')